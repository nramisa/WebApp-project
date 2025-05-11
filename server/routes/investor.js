const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const History = require('../models/History'); // assuming pitch history is stored here

router.get('/startups', auth, async (req, res) => {
  // optional: restrict access to only investors
  if (!req.user.isInvestor) return res.status(403).json({ message: 'Access denied' });

  try {
    const histories = await History.find().populate('user', 'name startupName email');
    const result = histories.map(h => ({
      startupName: h.user.startupName || h.user.name,
      pitchSummary: h.feedback?.structure?.slice(0, 200) + '...' || 'No feedback'
    }));
    res.json(result);
  } catch (err) {
    console.error('Investor route failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
