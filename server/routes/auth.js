const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const axios    = require('axios');

const router = express.Router();
const rawExpiry = process.env.JWT_EXPIRES_IN || '7d';
const expiresIn = isNaN(Number(rawExpiry)) ? rawExpiry : Number(rawExpiry);

// Email validation helper
async function isEmailValid(email) {
  const apiKey = process.env.MAILBOXLAYER_API_KEY;
  const url = `http://apilayer.net/api/check?access_key=${apiKey}&email=${email}&smtp=1&format=1`;

  try {
    const { data } = await axios.get(url);
    return data.format_valid && data.smtp_check;
  } catch (err) {
    console.error('Email validation failed:', err.message);
    return false;
  }
}

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please enter all fields' });

    const valid = await isEmailValid(email);
    if (!valid) return res.status(400).json({ message: 'Please use a real, valid email address' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please enter all fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user/me
router.get('/user/me', auth, (req, res) => {
  res.json({
    id:    req.user._id,
    name:  req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin
  });
});

// PATCH /api/user/me
router.patch('/user/me', auth, async (req, res) => {
  const { name, email } = req.body;
  // (Optionally: validate email format or SMTP!)
  req.user.name  = name;
  req.user.email = email;
  await req.user.save();
  res.json({
    id: req.user._id,
    name: req.user.name,
    email:req.user.email,
    isAdmin: req.user.isAdmin
  });
});

module.exports = router;
