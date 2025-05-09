const express  = require('express');
const User     = require('../models/User');
const router   = express.Router();

// GET /api/auth/verify?token=...
router.get('/', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Verification token missing');

  const user = await User.findOne({ verificationToken: token });
  if (!user) return res.status(400).send('Invalid verification token');

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  // Redirect to your frontend confirmation page
  res.redirect(`${process.env.FRONTEND_URL}/verified`);
});

module.exports = router;
