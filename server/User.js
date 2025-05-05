const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['startup', 'investor'] },
    profile: {
      name: String,
      industry: String,
      interests: [String], // For investors
      bio: String,
      website: String,
      pitchDeck: String // URL to uploaded PDF
    },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }]
  });