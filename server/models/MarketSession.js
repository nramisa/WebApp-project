const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  domain:     String,
  metrics:    Object,
  score:      Number,
  analysis:   String,
  createdAt:  { type: Date, default: Date.now },
});
module.exports = mongoose.model('MarketSession', schema);
