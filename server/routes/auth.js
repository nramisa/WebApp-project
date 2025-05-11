const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const axios    = require('axios');

const router = express.Router();
const rawExpiry = process.env.JWT_EXPIRES_IN || '7d';
const expiresIn = isNaN(Number(rawExpiry)) ? rawExpiry : Number(rawExpiry);

// Email validation via MailboxLayer
async function isEmailValid(email) {
  const apiKey = process.env.MAILBOXLAYER_API_KEY;
  const url = `http://apilayer.net/api/check?access_key=${apiKey}&email=${email}&smtp=1&format=1`;
  try {
    const { data } = await axios.get(url);
    return data.format_valid && data.smtp_check;
  } catch {
    return false; // if API fails, treat as invalid
  }
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const valid = await isEmailValid(email);
    if (!valid) {
      return res.status(400).json({ message: 'Please use a real email address' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const isInvestor = role === 'investor';

    const user = await User.create({
      name,
      email,
      passwordHash,
      isInvestor
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });

    res.json({
      token,
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        isAdmin:    user.isAdmin,
        isInvestor: user.isInvestor
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });

    res.json({
      token,
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        isAdmin:    user.isAdmin,
        isInvestor: user.isInvestor
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
