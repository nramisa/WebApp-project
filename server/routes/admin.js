const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const User             = require('../models/User');
const Analysis         = require('../models/Analysis');
const InvestorSession  = require('../models/InvestorSession');
const MarketSession    = require('../models/MarketSession');

router.use(auth, adminOnly);

// Get all users
router.get('/users', async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
});

// Get all pitch analyses
router.get('/analyses', async (req, res) => {
  const results = await Analysis.find().populate('user', 'name email startupName');
  res.json(results);
});

// Get all investor Q&A sessions
router.get('/qa', async (req, res) => {
  const results = await InvestorSession.find().populate('user', 'name email startupName');
  res.json(results);
});

// Get all market validation sessions
router.get('/market', async (req, res) => {
  const results = await MarketSession.find().populate('user', 'name email startupName');
  res.json(results);
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res) => {
  const { name, email, isAdmin } = req.body;
  const updates = { name, email };
  // If you want to allow toggling admin status:
  if (typeof isAdmin === 'boolean') updates.isAdmin = isAdmin;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
  res.json(user);
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


module.exports = router;
