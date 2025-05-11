const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['analysis', 'qa', 'market'], required: true },
  content:   { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);
