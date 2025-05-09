// server/routes/analysis.js

const express       = require('express');
const multer        = require('multer');
const fs            = require('fs');
const path          = require('path');
const pdfParse      = require('pdf-parse');
const unzipper      = require('unzipper');
const { XMLParser } = require('fast-xml-parser');
const { OpenAI }    = require('openai');

// auth middleware that sets req.userId from JWT
const auth          = require('../middleware/auth');
// Mongoose model for storing analyses
const AnalysisMdl   = require('../models/Analysis');

const router = express.Router();

// Multer config: store in /uploads, max file size 25 MB
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 },
});

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Helper: extract text from PDF
async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const { text } = await pdfParse(buffer);
  return text;
}

// Helper: extract text from PPTX
async function extractTextFromPPTX(filePath) {
  const directory = await unzipper.Open.file(filePath);
  const parser = new XMLParser();
  let allText = '';

  for (const file of directory.files) {
    if (file.path.startsWith('ppt/slides/slide') && file.path.endsWith('.xml')) {
      const xmlBuffer = await file.buffer();
      const slideObj = parser.parse(xmlBuffer);
      const texts = [];
      (function walk(node) {
        if (node && typeof node === 'object') {
          for (const key in node) {
            if (key === 'a:t') texts.push(node[key]);
            else walk(node[key]);
          }
        }
      })(slideObj);
      allText += texts.join(' ') + '\n';
    }
  }

  return allText;
}

// Optional parser: split the AI’s raw text into your schema fields
function parseFeedback(raw) {
  // e.g. assume raw is three sections separated by headings
  const parts = raw.split(/\n-{3,}\n/).map(s => s.trim());
  return {
    structure: parts[0] || '',
    marketFit: parts[1] || '',
    readiness: parts[2] || '',
  };
}

router.post(
  '/analyze',
  auth,
  upload.single('file'),
  async (req, res) => {
    try {
      const { path: fp, originalname } = req.file;
      const ext = path.extname(originalname).toLowerCase();
      let textContent = '';

      if (ext === '.pdf') {
        textContent = await extractTextFromPDF(fp);
      } else if (ext === '.pptx') {
        textContent = await extractTextFromPPTX(fp);
      } else {
        fs.unlinkSync(fp);
        return res.status(400).json({ error: 'Unsupported file type. Only PDF and PPTX allowed.' });
      }

      fs.unlinkSync(fp);
      if (!textContent.trim()) {
        return res.status(400).json({ error: 'No readable text found in the file.' });
      }

      // Send to AI
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert presentation analyst.' },
          { role: 'user', content: `Analyze this presentation:\n\n${textContent}` },
        ],
        max_tokens: 500,
      });

      const aiText = completion.choices?.[0]?.message?.content;
      if (!aiText) {
        return res.status(502).json({ error: 'AI did not return any analysis.' });
      }

      // Parse and save feedback
      const feedback = parseFeedback(aiText);
      const saved = await AnalysisMdl.create({
        user:       req.userId,
        filename:   originalname,
        uploadedAt: new Date(),
        feedback,  
      });

      // Return the saved doc
      res.json({ analysis: saved });

    } catch (err) {
      console.error('🔥 Analysis error:', err);
      res.status(500).json({ error: 'Internal error during analysis.' });
    }
  }
);

module.exports = router;
