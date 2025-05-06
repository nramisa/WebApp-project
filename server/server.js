require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const authMiddleware = require('./utils/authMiddleware');
const parsePDF = require('./utils/pdfParser');
const Analysis = require('./models/Analysis');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Auth Routes
app.post('/api/login', (req, res) => {
  // Temporary mock login
  res.json({
    token: 'demo-token',
    role: req.body.email.includes('admin') ? 'admin' : 
          req.body.email.includes('investor') ? 'investor' : 'startup'
  });
});

// Analysis Route
app.post('/api/analyze', authMiddleware, async (req, res) => {
  try {
    const pdfData = await parsePDF(req.file.buffer);
    const newAnalysis = new Analysis({
      user: req.user.id,
      filename: req.file.originalname,
      content: pdfData.text,
      feedback: {
        score: Math.floor(Math.random() * 40) + 60,
        summary: "Sample feedback for demonstration"
      }
    });
    await newAnalysis.save();
    res.json(newAnalysis);
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
