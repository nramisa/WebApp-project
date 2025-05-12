const express = require('express');
const axios   = require('axios');
const auth    = require('../middleware/auth');
const router  = express.Router();

// Proxy GET /api/credits → https://openrouter.ai/api/v1/credits
router.get('/', auth, async (req, res) => {
  try {
    const resp = await axios.get('https://openrouter.ai/api/v1/credits', {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    res.json(resp.data);
  } catch (err) {
    console.error('Credits lookup failed:', err.response?.data || err.message);
    res.status(500).json({ error: 'Could not fetch credits' });
  }
});

module.exports = router;
