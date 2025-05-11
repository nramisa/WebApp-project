require('dotenv').config();
const express      = require('express');
const cookieParser = require('cookie-parser');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes        = require('./routes/auth');
const analysisRoutes    = require('./routes/analysis');
const modelsRoutes      = require('./routes/models');
const historyRoutes     = require('./routes/history');
const verifyRoutes      = require('./routes/verify');
const investorQARoutes  = require('./routes/investorQA');
const marketRoutes      = require('./routes/marketValidation');
const adminRoutes       = require('./routes/admin');
const userRoutes        = require('./routes/user');
const investorRoutes    = require('./routes/investor');  // <— new

const app = express();
app.use(cors({
origin: process.env.FRONTEND_URL,   // e.g. "https://my-app.vercel.app"
credentials: true                   // <- allow cookies across domains
}));
// Built-in JSON parser
app.use(express.json());
// Cookie parser (for reading httpOnly cookie “token”)
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
);

// Public & auth
app.use('/api/auth',       authRoutes);
app.use('/api/auth/verify', verifyRoutes);

// Protected / user profile
app.use('/api/user',       userRoutes);

// Core app functionality
app.use('/api/analysis',      analysisRoutes);
app.use('/api/models',        modelsRoutes);
app.use('/api/history',       historyRoutes);
app.use('/api/investor-qa',   investorQARoutes);
app.use('/api/market-validate', marketRoutes);

// Admin panel
app.use('/api/admin',         adminRoutes);

// Investor-only panel (new)
app.use('/api/investor',      investorRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// Connect to Mongo and start server
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
  .catch(err => console.error('📌 Mongo connection error:', err));
