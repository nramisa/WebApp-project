// server/routes/analysis.js
const express       = require('express');
const multer        = require('multer');
const pdfParse      = require('pdf-parse');
const unzipper      = require('unzipper');
const { XMLParser } = require('fast-xml-parser');
const OpenAI        = require('openai');

const auth     = require('../middleware/auth');
const Analysis = require('../models/Analysis');

const router = express.Router();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25 MB

// 1) Initialize OpenAI client against OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://yourdomain.com',  // change if needed
    'X-Title': 'PitchIn App'
  }
});

// helper: extract text from PPTX XML
function extractText(node) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node))  return node.map(extractText).join(' ');
  if (typeof node === 'object')
    return Object.values(node).map(extractText).join(' ');
  return '';
}

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // parse PDF or PPTX
    let text = '';
    const name = req.file.originalname.toLowerCase();
    const isPdf  = req.file.mimetype === 'application/pdf' || /\.pdf$/i.test(name);
    const isPptx = req.file.mimetype ===
                   'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                   /\.pptx$/i.test(name);

    if (isPdf) {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else if (isPptx) {
      const dir    = await unzipper.Open.buffer(req.file.buffer);
      const slides = dir.files.filter(f => /ppt\/slides\/slide\d+\.xml$/.test(f.path));
      const parser = new XMLParser({ ignoreAttributes: false });
      for (let s of slides) {
        const buffer = await s.buffer();
        text += extractText(parser.parse(buffer.toString())) + '\n\n';
      }
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Use PDF or PPTX.' });
    }

    // 2) Truncate to ~6000 chars to save tokens
    const MAX_CHARS = 6000;
    if (text.length > MAX_CHARS) {
      console.log(`✂️ Truncate text ${text.length}→${MAX_CHARS}`);
      text = text.slice(0, MAX_CHARS);
    }

    // 3) Build prompt
    const prompt = `
You are an expert at startup pitches. Analyze the following text and give feedback in three sections:
1) Structure
2) Market Fit
3) Investor Readiness

Text:
"""
${text}
"""
`;

    console.log(`🚀 Calling OpenRouter Qwen3 with prompt length ${prompt.length}`);

    // 4) Call the free model
    const completion = await openai.chat.completions.create({
      model:    'qwen3-235b-a22b',
      messages: [{ role: 'system', content: prompt }]
    });

    const contentStr = completion.choices[0].message.content;
    const parts      = contentStr.split(/\n?\d\)\s*/).slice(1);

    // 5) Persist
    const analysis = await Analysis.create({
      user:     req.userId,
      filename: req.file.originalname,
      feedback: {
        structure: parts[0]?.trim()  || '',
        marketFit: parts[1]?.trim()  || '',
        readiness: parts[2]?.trim()  || ''
      }
    });

    res.json(analysis);

  } catch (err) {
    console.error('🔥 Analysis error:', err);

    // if you somehow burn through Qwen’s 12.8B tokens/wk
    if (err.code === 'insufficient_quota' || err.status === 429) {
      return res.status(429).json({
        message: 'Free model quota exhausted—please wait before retrying.'
      });
    }

    res.status(500).json({ message: err.message || 'Analysis failed' });
  }
});

module.exports = router;
