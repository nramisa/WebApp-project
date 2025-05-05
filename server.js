require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const parsePDF = require('./utils/pdfParser');
const Analysis = require('./models/Analysis');
const authMiddleware = require('./utils/authMiddleware');

const app = express();
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Protected Routes
app.post('/api/analyze', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await parsePDF(fileBuffer);
    
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: `Analyze this startup pitch deck and provide JSON feedback with these keys: 
        structureSummary, marketFitScore (0-100), investorReadinessScore (0-100), 
        financialHealth, overallScore. Text: ${pdfData.text}`
      }]
    });

    const feedback = JSON.parse(analysis.choices[0].message.content);
    
    const newAnalysis = new Analysis({
      user: req.user.id,
      filename: req.file.originalname,
      feedback
    });

    await newAnalysis.save();
    res.json(feedback);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  } finally {
    if (req.file) fs.unlinkSync(req.file.path); // Cleanup uploaded file
  }
});

app.post('/api/generate-questions', authMiddleware, async (req, res) => {
  const { industry, stage } = req.body;
  
  try {
    const questions = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: `Generate 10 investor Q&A pairs for ${industry} industry at ${stage} stage. 
        Format as JSON array: [{question, suggestedAnswer}]`
      }]
    });

    res.json(JSON.parse(questions.choices[0].message.content));
  } catch (err) {
    res.status(500).json({ error: 'Question generation failed' });
  }
});

app.post('/api/market-validation', authMiddleware, async (req, res) => {
  const { description, industry } = req.body;

  try {
    const validation = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: `Provide market validation report as JSON with these keys: 
        marketSize (USD billions), competitionLevel (low/medium/high), 
        uniquenessScore (0-100), validationSummary. 
        For ${industry} industry: ${description}`
      }]
    });

    res.json(JSON.parse(validation.choices[0].message.content));
  } catch (err) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Production Setup
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));