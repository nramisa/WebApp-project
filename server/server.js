require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet = require('helmet');

const authRoutes     = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const modelsRoutes   = require('./routes/models');
const historyRoutes  = require('./routes/history');
const verifyRoutes   = require('./routes/verify');
const investorQARoutes = require('./routes/investorQA');
const marketRoutes   = require('./routes/marketValidation');
const adminRoutes    = require('./routes/admin');
const userRoutes     = require('./routes/user'); 
const investorMatchRoutes = require('./routes/investor');
const creditsRouter = require('./routes/credits');

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// Public & auth
app.use('/api/auth', authRoutes);
app.use('/api/auth/verify', verifyRoutes);
app.use('/api/credits', creditsRouter);
// Protected / user profile
app.use('/api/user', userRoutes);
// Your existing protected routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/investor-qa', investorQARoutes);
app.use('/api/market-validate', marketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/investor', investorMatchRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// Mongo
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(_ => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 3001, () =>
      console.log(`Server running on port ${process.env.PORT || 3001}`)
    );
  })
  .catch(err => console.error('📌 Mongo connection error:', err));
