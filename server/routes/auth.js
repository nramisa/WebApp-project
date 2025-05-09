const express            = require('express');
const bcrypt             = require('bcryptjs');
const jwt                = require('jsonwebtoken');
const User               = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');
const router             = express.Router();

const rawExpiry = process.env.JWT_EXPIRES_IN || '7d';
const expiresIn = isNaN(Number(rawExpiry)) ? rawExpiry : Number(rawExpiry);

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name||!email||!password)
      return res.status(400).json({ message: 'Please enter all fields' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    // send verification email
    await sendVerificationEmail(user.email, user.verificationToken);

    res.json({
      message: 'Signup successful! Please check your email to verify your account.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email||!password)
      return res.status(400).json({ message: 'Please enter all fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isVerified)
      return res.status(403).json({ message: 'Please verify your email first' });

    if (!await bcrypt.compare(password, user.passwordHash))
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Server error' });
  }
});

module.exports = router;
