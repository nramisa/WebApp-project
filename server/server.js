require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');

const authRoutes        = require('./routes/auth');
const analysisRoutes    = require('./routes/analysis');
const modelsRoutes      = require('./routes/models');
const historyRoutes     = require('./routes/history');
const verifyRoutes      = require('./routes/verify');
const investorQARoutes  = require('./routes/investorQA');
const marketRoutes      = require('./routes/marketValidation');
const adminRoutes       = require('./routes/admin');
const userRoutes        = require('./routes/user');
const investorMatchRoutes = require('./routes/investor');

const app = express();

// security & parsing
app.use(cors());
app.use(express.json());
app.use(helmet());

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// public/auth
app.use('/api/auth', authRoutes);
app.use('/api/auth/verify', verifyRoutes);

// protected/user-profile
app.use('/api/user', userRoutes);

// your AI & history routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/investor-qa', investorQARoutes);
app.use('/api/market-validate', marketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/investor', investorMatchRoutes);

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// connect to Mongo and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
    const port = process.env.PORT || 3001;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(err => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });
