require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const historyRoutes = require('./routes/history');

const app = express();
app.use(cors());
app.use(express.json());

// Mount your routers under /api
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/history', historyRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// Connect to MongoDB Atlas & start
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 3001, () =>
      console.log(`Server running on port ${process.env.PORT || 3001}`)
    );
  })
  .catch(err => console.error('MongoDB connection error:', err));
