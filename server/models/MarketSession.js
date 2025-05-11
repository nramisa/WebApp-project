const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startupName: String,
  domain:      String,
  metrics:     Object,
  score:       Number,
  advice:      String,  // new: detailed market advice
  createdAt:   { type: Date, default: Date.now },
});
module.exports = mongoose.model('MarketSession', schema);

