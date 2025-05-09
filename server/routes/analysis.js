const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const unzipper = require('unzipper');
const { PDFDocument } = require('pdf-lib');
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
  if (typeof node === 'object') return Object.values(node).map(extractText).join(' ');
  return '';
}

// helper: extract images from PDF
async function extractImagesFromPDF(pdfBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const images = [];
  for (let pageIndex = 0; pageIndex < pdfDoc.getPages().length; pageIndex++) {
    const page = pdfDoc.getPages()[pageIndex];
    const imagesOnPage = page.getImages();
    imagesOnPage.forEach(img => {
      images.push(img);
    });
  }
  return images;
}

// helper: extract images from PPTX
async function extractImagesFromPPTX(pptxBuffer) {
  const dir = await unzipper.Open.buffer(pptxBuffer);
  const imageFiles = dir.files.filter(f => /ppt\/media\//.test(f.path));
  const imageBuffers = [];
  for (let file of imageFiles) {
    const imgBuffer = await file.buffer();
    imageBuffers.push(imgBuffer);
  }
  return imageBuffers;
}

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let text = '';
    let images = [];
    const name = req.file.originalname.toLowerCase();
    const isPdf = req.file.mimetype === 'application/pdf' || /\.pdf$/i.test(name);
    const isPptx = req.file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || /\.pptx$/i.test(name);

    if (isPdf) {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
      images = await extractImagesFromPDF(req.file.buffer); // Extract images from PDF
    } else if (isPptx) {
      const dir = await unzipper.Open.buffer(req.file.buffer);
      const slides = dir.files.filter(f => /ppt\/slides\/slide\d+\.xml$/.test(f.path));
      const parser = new XMLParser({ ignoreAttributes: false });
      for (let s of slides) {
        const buf = await s.buffer();
        text += extractText(parser.parse(buf.toString())) + '\n\n';
      }
      images = await extractImagesFromPPTX(req.file.buffer); // Extract images from PPTX
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Use PDF or PPTX.' });
    }

    console.log('📝 Extracted text:', text);
    console.log('🖼️ Extracted images:', images);

    // Validate the extracted text
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        message: 'The uploaded file does not contain enough readable text. Please try a different file.'
      });
    }

    const MAX_CHARS = 6000;
    if (text.length > MAX_CHARS) {
      console.log(`✂️ Truncate text ${text.length} → ${MAX_CHARS}`);
      text = text.slice(0, MAX_CHARS);
    }

    const prompt = `
You are an expert at startup pitches. Analyze the following text and any relevant images, then provide feedback in three sections:
1) Structure
2) Market Fit
3) Investor Readiness

Text:
"""
${text}
"""

Images:
Please describe any relevant images in the context of the pitch (if applicable).
`;

    console.log(`🚀 Calling OpenRouter Qwen3 with prompt length ${prompt.length}`);

    const completion = await openai.chat.completions.create({
      model: 'google/gemma-3-27b-it:free', // or another model
      messages: [{ role: 'system', content: prompt }]
    });

    const contentStr = completion?.choices?.[0]?.message?.content;

    if (!contentStr) {
      return res.status(500).json({
        message: 'AI response was invalid or empty. Try a different file or retry later.'
      });
    }

    const parts = contentStr.split(/\n?\d\)\s*/).slice(1);

    const analysis = await Analysis.create({
      user: req.userId,
      filename: req.file.originalname,
      feedback: {
        structure: parts[0]?.trim() || 'No structure feedback available.',
        marketFit: parts[1]?.trim() || 'No market fit feedback available.',
        readiness: parts[2]?.trim() || 'No investor readiness feedback available.'
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
