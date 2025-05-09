require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');

const authRoutes     = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const modelsRoutes   = require('./routes/models');
const historyRoutes  = require('./routes/history');
const verifyRoutes   = require('./routes/verify'); // ✅ Added verification route
const investorRoutes = require('./routes/investorQA');
const marketRoutes   = require('./routes/marketValidation');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/verify', verifyRoutes); // ✅ Email verification link
app.use('/api/analysis', analysisRoutes);
app.use('/api/models', modelsRoutes); 
app.use('/api/history', historyRoutes);
app.use('/api/investor-qa', investorRoutes);
app.use('/api/market-validate', marketRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 3001, () =>
      console.log(`Server running on port ${process.env.PORT || 3001}`)
    );
  })
  .catch(err => console.error('MongoDB connection error:', err));
