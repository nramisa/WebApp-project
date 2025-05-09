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
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// helper to pull text out of pptx XML
function extractText(node) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node))  return node.map(extractText).join(' ');
  if (typeof node === 'object')
    return Object.values(node).map(extractText).join(' ');
  return '';
}

// POST /api/analysis/upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    // 1) validate file
    if (!req.file) {
      console.warn('⚠️  No file on req.file');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('📥 Received file:', {
      originalName: req.file.originalname,
      mimeType:     req.file.mimetype,
      size:         req.file.size
    });

    const name    = req.file.originalname.toLowerCase();
    const isPdf   = req.file.mimetype === 'application/pdf' || /\.pdf$/i.test(name);
    const isPptx  = req.file.mimetype ===
                     'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                     /\.pptx$/i.test(name);

    let text = '';

    // 2) PDF path
    if (isPdf) {
      try {
        const data = await pdfParse(req.file.buffer);
        text = data.text;
      } catch (parseErr) {
        console.error('❌ PDF parse error:', parseErr);
        return res.status(500).json({ message: 'PDF parse error: ' + parseErr.message });
      }

    // 3) PPTX path
    } else if (isPptx) {
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

    // 4) unsupported
    } else {
      console.warn('⚠️  Unsupported file type:', req.file.mimetype);
      return res.status(400).json({
        message: 'Unsupported file type. Please upload a PDF or PPTX file.'
      });
    }

    // 5) build prompt
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

    // 6) call OpenAI
    const completion = await openai.chat.completions.create({
      model:    'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }]
    });

    const contentStr = completion.choices[0].message.content;
    const parts      = contentStr.split(/\n?\d\)\s*/).slice(1);

    // 7) save to Mongo
    const analysis = await Analysis.create({
      user:     req.userId,
      filename: req.file.originalname,
      feedback: {
        structure: parts[0]?.trim()  || '',
        marketFit: parts[1]?.trim()  || '',
        readiness: parts[2]?.trim()  || ''
      }
    });

    // 8) return
    res.json(analysis);

  } catch (err) {
    console.error('🔥 Analysis route error:', err);
    res.status(500).json({ message: err.message || 'Analysis failed' });
  }
});

module.exports = router;
