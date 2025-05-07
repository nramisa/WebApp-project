// server/routes/analysis.js
const express   = require('express');
const multer    = require('multer');
const pdfParse  = require('pdf-parse');
const unzipper = require('unzipper');
const { XMLParser } = require('fast-xml-parser');
const { Configuration, OpenAIApi } = require('openai');

const auth      = require('../middleware/auth');
const Analysis  = require('../models/Analysis');

const router = express.Router();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB

// initialize OpenAI
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

// POST /api/analysis/upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    let text = '';
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else {
      text = await pptxParser.parseBuffer(req.file.buffer);
    }

    // build prompt
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

    const aiRes = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }]
    });

    const content = aiRes.data.choices[0].message.content;
    const parts = content.split(/\n?\d\)\s*/).slice(1); 
    // parts[0]: after 1) -> Structure, parts[1]: after 2), parts[2]: after 3)

    const analysis = await Analysis.create({
      user: req.userId,
      filename: req.file.originalname,
      feedback: {
        structure: parts[0]?.trim() || '',
        marketFit: parts[1]?.trim() || '',
        readiness: parts[2]?.trim() || ''
      }
    });

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Analysis failed' });
  }
});

module.exports = router;
