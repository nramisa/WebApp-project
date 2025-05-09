const express = require('express');
const { OpenAI } = require('openai');
const auth = require('../middleware/auth');
const InvestorSession = require('../models/InvestorSession');

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

router.post('/', auth, async (req, res) => {
  const { investorType, fundingStage, domain } = req.body;

  if (!investorType || !fundingStage || !domain) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const prompt = `You are an expert investor.
Generate 10 thoughtful and realistic questions a ${investorType} investor would ask a startup in the ${domain} sector at the ${fundingStage} stage.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
    });

    const raw = completion.choices?.[0]?.message?.content || '';
    const questions = raw.split('\n').filter(line => line.trim().length > 0);

    const session = await InvestorSession.create({
      user: req.userId,
      investorType,
      fundingStage,
      domain,
      questions,
    });

    res.json({ questions: session.questions });
  } catch (err) {
    console.error('Investor QA error:', err);
    res.status(500).json({ error: 'Failed to generate investor questions.' });
  }
});

router.get('/history', auth, async (req, res) => {
  const history = await InvestorSession.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(history);
});

module.exports = router;
