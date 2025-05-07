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
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB max

// initialize OpenAI client (v4 SDK)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// helper: recursively extract <a:t> text from parsed XML nodes
function extractText(node) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (typeof node === 'object') {
    return Object.values(node)
      .map(extractText)
      .join(' ');
  }
  return '';
}

// POST /api/analysis/upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    let text = '';

    // 1) PDF
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text;

    // 2) PPTX
    } else if (
      req.file.mimetype ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      const directory = await unzipper.Open.buffer(req.file.buffer);
      const slides = directory.files.filter(f =>
        /ppt\/slides\/slide\d+\.xml$/.test(f.path)
      );

      const parser = new XMLParser({ ignoreAttributes: false });
      let accumulated = '';

      for (let slideFile of slides) {
        const content = await slideFile.buffer();
        const json    = parser.parse(content.toString());
        accumulated  += extractText(json) + '\n\n';
      }

      text = accumulated;

    // 3) reject others
    } else {
      return res
        .status(400)
        .json({ message: 'Unsupported file type. Please upload PDF or PPTX.' });
    }

    // 4) Build prompt
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

    // 5) Call the Chat Completion endpoint
    const completion = await openai.chat.completions.create({
      model:    'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }]
    });

    const contentStr = completion.choices[0].message.content;
    const parts      = contentStr.split(/\n?\d\)\s*/).slice(1);

    // 6) Persist to MongoDB
    const analysis = await Analysis.create({
      user:     req.userId,
      filename: req.file.originalname,
      feedback: {
        structure: parts[0]?.trim()  || '',
        marketFit: parts[1]?.trim()  || '',
        readiness: parts[2]?.trim()  || ''
      }
    });

    // 7) Return result
    res.json(analysis);

  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ message: 'Analysis failed' });
  }
});

module.exports = router;
