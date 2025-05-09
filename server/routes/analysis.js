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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

// Extract text from PPTX
async function extractTextFromPPTX(filePath) {
  const directory = await unzipper.Open.file(filePath);
  const parser = new XMLParser();
  let allText = '';

  for (const file of directory.files) {
    if (file.path.startsWith('ppt/slides/slide') && file.path.endsWith('.xml')) {
      const content = await file.buffer();
      const slideText = parser.parse(content);
      const texts = [];

      const extractTextRecursively = (node) => {
        if (typeof node === 'object') {
          for (const key in node) {
            if (key === 'a:t') {
              texts.push(node[key]);
            } else {
              extractTextRecursively(node[key]);
            }
          }
        }
      };

      extractTextRecursively(slideText);
      allText += texts.join(' ') + '\n';
    }
  }

  return allText;
}

// Main analysis route
router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    let textContent = '';

    if (ext === '.pdf') {
      textContent = await extractTextFromPDF(filePath);
    } else if (ext === '.pptx') {
      textContent = await extractTextFromPPTX(filePath);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unsupported file type. Only PDF and PPTX are allowed.' });
    }

    fs.unlinkSync(filePath); // clean up temp file

    if (!textContent.trim()) {
      return res.status(400).json({ error: 'No readable text found in the file.' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Analyze the content below and give an overview:\n\n${textContent}`
        }
      ]
    });

    const analysis = completion.choices[0].message.content;
    res.json({ analysis });

  } catch (error) {
    console.error('🔥 Analysis error:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the file.' });
  }
});

module.exports = router;
