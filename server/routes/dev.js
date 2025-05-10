// server/routes/dev.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const router  = express.Router();

// WARNING: remove this in production once you've generated your hash!
router.get('/hash/:password', (req, res) => {
  const { password } = req.params;
  const hash = bcrypt.hashSync(password, 12);
  res.json({ password, hash });
});

module.exports = router;
