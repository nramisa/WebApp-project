const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const User    = require('../models/User');

router.use(auth);

// PATCH /api/user/me
router.patch('/me', async (req, res) => {
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }
  // If email changed, ensure uniqueness
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
    // return only safe fields
    return res.json({
      id:       req.user._id,
      name:     req.user.name,
      email:    req.user.email,
      isAdmin:  req.user.isAdmin,
      // if you have startupName on User schema:
      startupName: req.user.startupName || ''
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
