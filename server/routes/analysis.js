// server/routes/analysis.js
const express       = require('express');
const multer        = require('multer');
const pdfParse      = require('pdf-parse');
const unzipper      = require('unzipper');
const { XMLParser } = require('fast-xml-parser');
const { Configuration, OpenAIApi } = require('openai');

const auth     = require('../middleware/auth');
const Analysis = require('../models/Analysis');

const router = express.Router();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB max

// initialize OpenAI client
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

// helper: recursively extract text nodes
function extractText(node) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (typeof node === 'object') {
    let text = '';
    for (let key in node) {
      if (key === 'a:t') text += node[key] + ' ';
      else text += extractText(node[key]);
    }
    return text;
  }
  return '';
}

// POST /api/analysis/upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    let text = '';

    // 1) PDF handling
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text;

    // 2) PPTX handling
    } else if (
      req.file.mimetype === 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      // unzip the PPTX buffer
      const directory = await unzipper.Open.buffer(req.file.buffer);

      // find all slide XML files
      const slides = directory.files.filter(f =>
        /ppt\/slides\/slide\d+\.xml$/.test(f.path)
      );

      // parse and extract text from each slide
      const parser = new XMLParser({ ignoreAttributes: false });
      let accumulated = '';

      for (let slideFile of slides) {
        const content = await slideFile.buffer();
        const json = parser.parse(content.toString());

        // extract text recursively
        accumulated += extractText(json) + '\n\n';
      }

      text = accumulated;

    // 3) unsupported type
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Please upload PDF or PPTX.' });
    }

    // 4) Build the prompt for OpenAI
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

    // 5) Call OpenAI
    const aiRes = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }]
    });

    const content = aiRes.data.choices[0].message.content;
    // split on “1)”, “2)”, “3)” (or “1) ”, “2) ”, “3) ”)
    const parts = content.split(/\n?\d\)\s*/).slice(1);

    // 6) Save to MongoDB
    const analysis = await Analysis.create({
      user: req.userId,
      filename: req.file.originalname,
      feedback: {
        structure: parts[0]?.trim()  || '',
        marketFit: parts[1]?.trim()  || '',
        readiness: parts[2]?.trim()  || ''
      }
    });

    // 7) Return the saved document
    res.json(analysis);

  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ message: 'Analysis failed' });
  }
});

module.exports = router;
