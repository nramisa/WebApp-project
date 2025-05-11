const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const axios    = require('axios');
const User     = require('../models/User');

const router = express.Router();

// Token lifetimes
const ACCESS_EXPIRES  = '15m';  // short-lived access
const REFRESH_EXPIRES = '7d';   // long-lived refresh

// Email validation
async function isEmailValid(email) {
  const apiKey = process.env.MAILBOXLAYER_API_KEY;
  const url    = `http://apilayer.net/api/check?access_key=${apiKey}&email=${email}&smtp=1&format=1`;
  try {
    const { data } = await axios.get(url);
    return data.format_valid && data.smtp_check;
  } catch (err) {
    console.error('MailboxLayer error:', err.message);
    return false;
  }
}

// Token helpers
function signAccessToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET,  { expiresIn: ACCESS_EXPIRES });
}
function signRefreshToken(id) {
  return jwt.sign({ id }, process.env.REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    if (!await isEmailValid(email)) {
      return res.status(400).json({ message: 'Please use a real email address' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const isInvestor   = role === 'investor';
    const user = await User.create({ name, email, passwordHash, isInvestor });

    const accessToken  = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    res
      .cookie('accessToken',  accessToken,  {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   15 * 60 * 1000,        // 15m
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   7 * 24 * 60 * 60 * 1000 // 7d
      })
      .status(201)
      .json({
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

    const accessToken  = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    res
      .cookie('accessToken',  accessToken,  {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   15 * 60 * 1000,        // 15m
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   7 * 24 * 60 * 60 * 1000 // 7d
      })
      .json({
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

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).end();

  try {
    const { id } = jwt.verify(token, process.env.REFRESH_SECRET);
    const newAccessToken = signAccessToken(id);

    return res
      .cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   15 * 60 * 1000,  // 15m
      })
      .status(200)
      .json({});
  } catch {
    return res.status(401).json({ message: 'Refresh token invalid' });
  }
});

module.exports = router;
