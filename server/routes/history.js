// server/routes/history.js
const express  = require('express');
const auth     = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const router   = express.Router();

// GET /api/history
router.get('/', auth, async (req, res) => {
  try {
    const items = await Analysis.find({ user: req.userId })
      .sort({ uploadedAt: -1 })
      .limit(50);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch history' });
  }
});

module.exports = router;
