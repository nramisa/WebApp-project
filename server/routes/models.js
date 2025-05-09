// server/routes/models.js

const express = require('express');
const OpenAI  = require('openai');

const router = express.Router();

// Initialize the OpenAI client **against** OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://your-frontend-domain.com', // change to your app’s URL
    'X-Title': 'PitchIn App'
  }
});

// GET /api/models/list-models
// Returns a JSON array of all model IDs your key can call
router.get('/list-models', async (req, res) => {
  try {
    const response = await openai.models.list();       // calls GET /api/v1/models
    const ids = response.data.map(m => m.id);          // extract just the ID strings
    res.json({ models: ids });
  } catch (err) {
    console.error('Model-list error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
