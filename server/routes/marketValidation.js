const express = require('express');
const { OpenAI } = require('openai');
const auth = require('../middleware/auth');
const MarketSession = require('../models/MarketSession');

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

router.post('/', auth, async (req, res) => {
  const { domain, metrics } = req.body;

  if (!domain || !metrics) {
    return res.status(400).json({ error: 'Domain and metrics required.' });
  }

  const metricSummary = Object.entries(metrics).map(([key, val]) => `${key}: ${val}`).join(', ');

  const prompt = `Assess the following startup in the ${domain} space:
${metricSummary}

Rate the startup's chance of success on a scale of 0 to 100. Explain briefly.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const text = completion.choices?.[0]?.message?.content || '';
    const scoreMatch = text.match(/(\d{1,3})/);
    const score = scoreMatch ? Math.min(100, parseInt(scoreMatch[1])) : 50;

    const session = await MarketSession.create({
      user: req.userId,
      domain,
      metrics,
      score,
      analysis: text,
    });

    res.json({ score, analysis: text });
  } catch (err) {
    console.error('Market validation error:', err);
    res.status(500).json({ error: 'Validation failed.' });
  }
});

router.get('/history', auth, async (req, res) => {
  const history = await MarketSession.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(history);
});

module.exports = router;
