const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investorType: String,
  fundingStage: String,
  domain:       String,
  questions:    [String],
  createdAt:    { type: Date, default: Date.now },
});
module.exports = mongoose.model('InvestorSession', schema);
