const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const User    = require('../models/User');

router.use(auth);

// GET /api/user/me
router.get('/me', async (req, res) => {
  const u = req.user;
  res.json({
    id:          u._id,
    name:        u.name,
    email:       u.email,
    isAdmin:     u.isAdmin,
    isInvestor:  u.isInvestor,
    startupName: u.startupName || ''
  });
});

// PATCH /api/user/me
router.patch('/me', async (req, res) => {
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  // Ensure new email is not taken
  if (email !== req.user.email) {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already in use.' });
    }
  }

  try {
    req.user.name  = name;
    req.user.email = email;
    await req.user.save();
    res.json({
      id:          req.user._id,
      name:        req.user.name,
      email:       req.user.email,
      isAdmin:     req.user.isAdmin,
      isInvestor:  req.user.isInvestor,
      startupName: req.user.startupName || ''
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
