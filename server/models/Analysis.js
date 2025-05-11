const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename:   { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  feedback: {
    structure:  String,
    marketFit:  String,
    readiness:  String
  }
});
module.exports = mongoose.model('Analysis', analysisSchema);
