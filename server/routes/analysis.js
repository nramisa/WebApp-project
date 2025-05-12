const express       = require('express');
const multer        = require('multer');
const fs            = require('fs');
const path          = require('path');
const pdfParse      = require('pdf-parse');
const unzipper      = require('unzipper');
const { XMLParser } = require('fast-xml-parser');
const { OpenAI }    = require('openai');

const auth        = require('../middleware/auth');
const AnalysisMdl = require('../models/Analysis');

const router = express.Router();

// Accept up to 4 files, each ≤25 MB, under the field name “files”
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 },
}).array('files', 4);

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const { text } = await pdfParse(buffer);
  return text;
}

async function extractTextFromPPTX(filePath) {
  const dir = await unzipper.Open.file(filePath);
  const parser = new XMLParser();
  let allText = '';
  for (const file of dir.files) {
    if (file.path.startsWith('ppt/slides/slide') && file.path.endsWith('.xml')) {
      const xml = await file.buffer();
      const slideObj = parser.parse(xml);
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

// Simple splitter: first third → structure, next → marketFit, last → readiness
function parseFeedback(raw) {
  const parts = raw.split('\n\n').filter(p => p.trim());
  return {
    structure: parts[0] || '',
    marketFit: parts[1] || '',
    readiness: parts[2] || '',
  };
}

router.post(
  '/analyze',
  auth,
  (req, res, next) => upload(req, res, err => err ? next(err) : next()),
  async (req, res) => {
    try {
      if (!req.files || !req.files.length) {
        return res.status(400).json({ error: 'No files uploaded under field "files".' });
      }

      const results = [];

      for (const fileObj of req.files) {
        const { path: fp, originalname } = fileObj;
        const ext = path.extname(originalname).toLowerCase();
        let text = '';

        try {
          if (ext === '.pdf') {
            text = await extractTextFromPDF(fp);
          } else if (ext === '.pptx') {
            text = await extractTextFromPPTX(fp);
          } else {
            throw new Error('Unsupported file type');
          }
        } catch (e) {
          results.push({ file: originalname, error: e.message });
          fs.unlinkSync(fp);
          continue;
        }

        fs.unlinkSync(fp);

        if (!text.trim()) {
          results.push({ file: originalname, error: 'No readable text found.' });
          continue;
        }

        // Ask the AI
        let completion;
        try {
          completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo-0613',
            messages: [
              { role: 'system', content: 'You are an expert presentation analyst.' },
              { role: 'user', content: `Analyze this presentation:\n\n${text}` }
            ],
            max_tokens: 350,
          });
        } catch (apiErr) {
          // handle insufficient credits
          if (apiErr?.error?.code === 402) {
            results.push({
              file: originalname,
              error: 'Insufficient credits. Please shorten or split the file.'
            });
            continue;
          }
          throw apiErr;
        }

        const aiText = completion.choices?.[0]?.message?.content;
        if (!aiText) {
          results.push({ file: originalname, error: 'AI returned no analysis.' });
          continue;
        }

        // Parse & save
        const feedback = parseFeedback(aiText);
        const saved = await AnalysisMdl.create({
          user:       req.userId,
          filename:   originalname,
          uploadedAt: new Date(),
          feedback,
        });

        results.push({ file: originalname, analysis: saved });
      }

      res.json({ results });

    } catch (err) {
      if (err instanceof multer.MulterError) {
        // e.g. file too large, unexpected field, etc.
        return res.status(400).json({ error: err.message });
      }
      console.error('🔥 Analysis route error:', err);
      res.status(500).json({ error: 'Internal server error during analysis.' });
    }
  }
);

module.exports = router;
