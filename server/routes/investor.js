const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const User = require('../models/User');

// Only investors can see startup pitch summaries
router.get('/startups', auth, async (req, res) => {
  if (!req.user.isInvestor) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const results = await Analysis.find()
      .populate('user', 'startupName')
      .sort({ uploadedAt: -1 });

    const uniqueStartups = [];
    const seen = new Set();

    for (const result of results) {
      const uid = result.user?._id?.toString();
      if (uid && !seen.has(uid)) {
        seen.add(uid);
        uniqueStartups.push({
          startupName: result.user?.startupName || 'Unnamed Startup',
          pitchSummary: result.feedback?.structure?.substring(0, 100) || 'No summary available'
        });
      }
    }

    res.json(uniqueStartups);
  } catch (err) {
    console.error('Investor /startups error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
