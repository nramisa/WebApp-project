const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const Analysis = require('../models/Analysis');

router.get('/startups', auth, async (req, res) => {
  // only investors get this list
  if (!req.user.isInvestor) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    // pull all pitch analyses, newest first
    const all = await Analysis.find()
      .populate('user', 'startupName')
      .sort({ uploadedAt: -1 });

    // dedupe per startup
    const seen = new Set();
    const list = [];
    for (let a of all) {
      const uid = a.user._id.toString();
      if (!seen.has(uid)) {
        seen.add(uid);
        list.push({
          startupName:  a.user.startupName || 'Unnamed Startup',
          pitchSummary: (a.feedback?.structure || '').slice(0, 100) || 'No summary available'
        });
      }
    }

    res.json(list);
  } catch (err) {
    console.error('Investor panel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
