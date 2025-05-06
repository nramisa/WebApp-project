require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const authMiddleware = require('./utils/authMiddleware');
const parsePDF = require('./utils/pdfParser');
const Analysis = require('./models/Analysis');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Connection Events
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB: ${mongoose.connection.db.databaseName}`);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Auth Routes
app.post('/api/login', (req, res) => {
  // Demo authentication (replace with real implementation)
  const role = req.body.email.includes('admin') ? 'admin' :
               req.body.email.includes('investor') ? 'investor' : 'startup';
  
  // Mock JWT token (replace with real JWT implementation)
  const token = jwt.sign(
    { email: req.body.email, role }, 
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    token,
    role,
    userData: {
      name: 'Demo User',
      email: req.body.email
    }
  });
});

// Analysis Endpoint
app.post('/api/analyze', authMiddleware, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const pdfData = await parsePDF(req.file.buffer);
    
    const analysis = new Analysis({
      user: req.user.id,
      filename: req.file.originalname,
      content: pdfData.text,
      feedback: {
        score: Math.floor(Math.random() * 40) + 60,
        summary: "Sample analysis:\n- Strong market potential\n- Needs financial clarity\n- Good team structure"
      }
    });

    await analysis.save();
    
    res.json({
      score: analysis.feedback.score,
      feedback: analysis.feedback.summary,
      filename: analysis.filename
    });

  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB host: ${mongoose.connection.host}`);
});
