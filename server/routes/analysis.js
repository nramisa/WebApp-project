const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const unzipper = require('unzipper');
const { XMLParser } = require('fast-xml-parser');
const { OpenAI } = require('openai');

const router = express.Router();
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max per file
});

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractTextFromPPTX(filePath) {
  const directory = await unzipper.Open.file(filePath);
  const parser = new XMLParser();
  let allText = '';

  for (const file of directory.files) {
    if (file.path.startsWith('ppt/slides/slide') && file.path.endsWith('.xml')) {
      const content = await file.buffer();
      const slideText = parser.parse(content);
      const texts = [];

      (function walk(node) {
        if (typeof node === 'object') {
          for (const key in node) {
            if (key === 'a:t') texts.push(node[key]);
            else walk(node[key]);
          }
        }
      })(slideText);

      allText += texts.join(' ') + '\n';
    }
  }

  return allText;
}

router.post('/analyze', upload.array('files', 4), async (req, res) => {
  try {
    const results = [];

    for (const fileObj of req.files) {
      const { path: fp, originalname } = fileObj;
      const ext = path.extname(originalname).toLowerCase();
      let textContent = '';

      try {
        if (ext === '.pdf') {
          textContent = await extractTextFromPDF(fp);
        } else if (ext === '.pptx') {
          textContent = await extractTextFromPPTX(fp);
        } else {
          results.push({ file: originalname, error: 'Unsupported file type' });
          continue;
        }

        fs.unlinkSync(fp);

        if (!textContent.trim()) {
          results.push({ file: originalname, error: 'No readable text found in the file.' });
          continue;
        }

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are an expert presentation analyst.' },
            { role: 'user', content: `Please provide a concise summary and key insights:\n\n${textContent}` },
          ],
          max_tokens: 500,
        });

        const choices = completion.choices || completion.data?.choices || [];
        if (!choices.length) {
          results.push({ file: originalname, error: 'No analysis returned by AI.' });
        } else {
          results.push({ file: originalname, analysis: choices[0].message?.content ?? String(choices[0]) });
        }

      } catch (err) {
        console.error(`Error processing file ${originalname}:`, err);
        results.push({
          file: originalname,
          error: err?.error?.message || 'An internal error occurred while analyzing this file.',
        });
      }
    }

    res.json({ results });

  } catch (err) {
    console.error('🔥 Batch analysis error:', err);
    res.status(500).json({ error: 'Internal server error during batch analysis.' });
  }
});

module.exports = router;
