const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib'); // Used for extracting images from PDF
const pdf2pic = require("pdf2pic"); // To convert PDF to images
const unzipper = require('unzipper');
const { XMLParser } = require('fast-xml-parser');
const OpenAI = require('openai');
const auth = require('../middleware/auth');
const Analysis = require('../models/Analysis');

const router = express.Router();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25 MB

// Init OpenRouter client
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://web-app-project-umber.vercel.app/',
    'X-Title': 'PitchIn App'
  }
});

// helper: extract PPTX text
function extractText(node) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (typeof node === 'object')
    return Object.values(node).map(extractText).join(' ');
  return '';
}

// Extract images from a PDF
async function extractImagesFromPDF(pdfBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const images = [];

  for (let i = 0; i < pdfDoc.getPages().length; i++) {
    const page = pdfDoc.getPages()[i];
    const imageObjects = page.node.Annots ? page.node.Annots : [];
    imageObjects.forEach((image) => {
      // Do something with image like saving it to the disk or adding it to the images array
      images.push(image);
    });
  }

  return images;
}

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // parse PDF or PPTX
    let text = '';
    let images = [];
    const name = req.file.originalname.toLowerCase();
    const isPdf = req.file.mimetype === 'application/pdf' || /\.pdf$/i.test(name);
    const isPptx = req.file.mimetype ===
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      /\.pptx$/i.test(name);

    if (isPdf) {
      // Extract text from PDF
      const data = await pdfParse(req.file.buffer);
      text = data.text;

      // Extract images from PDF
      images = await extractImagesFromPDF(req.file.buffer);
    } else if (isPptx) {
      const dir = await unzipper.Open.buffer(req.file.buffer);
      const slides = dir.files.filter(f => /ppt\/slides\/slide\d+\.xml$/.test(f.path));
      const parser = new XMLParser({ ignoreAttributes: false });
      for (let s of slides) {
        const buf = await s.buffer();
        text += extractText(parser.parse(buf.toString())) + '\n\n';
      }
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Use PDF or PPTX.' });
    }

    // Log the raw text and images (for debugging)
    console.log('📝 Extracted text from file:\n', text);
    console.log('📸 Extracted images:', images);

    // Validate the extracted text
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        message: 'The uploaded file does not contain enough readable text. Please try a different file.'
      });
    }

    // truncate for token savings
    const MAX_CHARS = 6000;
    if (text.length > MAX_CHARS) {
      console.log(`✂️ Truncate text ${text.length} → ${MAX_CHARS}`);
      text = text.slice(0, MAX_CHARS);
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

    console.log(`🚀 Calling OpenRouter Qwen3 with prompt length ${prompt.length}`);

    // AI completion
    const completion = await openai.chat.completions.create({
      model: 'qwen/qwen3-235b-a22b:free',
      messages: [{ role: 'system', content: prompt }]
    });

    const contentStr = completion?.choices?.[0]?.message?.content;

    if (!contentStr) {
      return res.status(500).json({
        message: 'AI response was invalid or empty. Try a different file or retry later.'
      });
    }

    const parts = contentStr.split(/\n?\d\)\s*/).slice(1);

    // persist
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
    console.error('🔥 Analysis error:', err);
    if (err.code === 'insufficient_quota' || err.status === 429) {
      return res.status(429).json({ message: 'Free model quota exhausted—please wait.' });
    }
    res.status(500).json({ message: err.message || 'Analysis failed' });
  }
});

module.exports = router;

