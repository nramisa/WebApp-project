const mongoose = require('mongoose');
const crypto   = require('crypto');

const userSchema = new mongoose.Schema({
  name:              { type: String, required: true },
  email:             { type: String, unique: true, required: true },
  passwordHash:      { type: String, required: true },
  isVerified:        { type: Boolean, default: false },
  isAdmin:           { type: Boolean, default: false },
  isInvestor:        { type: Boolean, default: false }, 
  startupName:       { type: String },
  verificationToken: { type: String, default: () => crypto.randomBytes(32).toString('hex') },
  createdAt:         { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

