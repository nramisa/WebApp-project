const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Access token expired' });
  }
};
