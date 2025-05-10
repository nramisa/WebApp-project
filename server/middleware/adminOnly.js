// server/middleware/adminOnly.js
module.exports = (req, res, next) => {
  // req.user is set by your auth middleware
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
};
