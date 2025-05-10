// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token, authorization denied' });

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 🔑 Load full user including isAdmin
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user; // ✅ attach full user object to request
    req.userId = user._id;   // ✅ add this line for routes expecting userId
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
