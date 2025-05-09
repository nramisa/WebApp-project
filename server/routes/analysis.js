// server/routes/analysis.js

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const unzipper = require('unzipper');
const { XMLParser } = require('fast-xml-parser');
const { OpenAI } = require('openai');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,       // or OPENAI_API_KEY if you’re using OpenAI’s endpoint
  baseURL: 'https://openrouter.ai/api/v1',      // adjust if needed
});

// Helper: extract text from PDF files
async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

// Helper: extract text from PPTX files
async function extractTextFromPPTX(filePath) {
  const directory = await unzipper.Open.file(filePath);
  const parser = new XMLParser();
  let allText = '';

  for (const file of directory.files) {
    if (file.path.startsWith('ppt/slides/slide') && file.path.endsWith('.xml')) {
      const content = await file.buffer();
      const slideObj = parser.parse(content);
      const texts = [];

      (function walk(node) {
        if (typeof node === 'object') {
          for (const key in node) {
            if (key === 'a:t') {
              texts.push(node[key]);
            } else {
              walk(node[key]);
            }
          }
        }
      })(slideObj);

      allText += texts.join(' ') + '\n';
    }
  }

  return allText;
}

router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    // 1) Read & extract text
    const { path: filePath, originalname } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    let textContent = '';

    if (ext === '.pdf') {
      textContent = await extractTextFromPDF(filePath);
    } else if (ext === '.pptx') {
      textContent = await extractTextFromPPTX(filePath);
    } else {
      // cleanup
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unsupported file type. Only PDF and PPTX allowed.' });
    }

    // remove the uploaded file
    fs.unlinkSync(filePath);

    if (!textContent.trim()) {
      return res.status(400).json({ error: 'No readable text found in the file.' });
    }

    // 2) Send to AI and log raw response
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4',
      messages: [{
        role: 'user',
        content: `Provide a concise summary and key insights of this content:\n\n${textContent}`,
      }],
    });
    console.log('🔹 OpenAI raw response:', completion);

    // 3) Defensive guard: ensure we have choices
    const choices = completion.choices || completion.data?.choices;
    if (!Array.isArray(choices) || choices.length === 0) {
      console.error('❌ AI API returned no choices:', completion);
      return res.status(502).json({ error: 'AI service did not return any analysis.' });
    }

    // 4) Safely extract analysis text
    const analysisText = choices[0].message?.content ?? String(choices[0]);
    res.json({ analysis: analysisText });

  } catch (error) {
    console.error('🔥 Analysis error:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the file.' });
  }
});

module.exports = router;
