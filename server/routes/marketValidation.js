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
  const { startupName, domain, metrics } = req.body;
  if (!startupName || !domain || !metrics) {
    return res.status(400).json({ error: 'startupName, domain, and metrics are required.' });
  }

  const metricSummary = Object.entries(metrics)
    .map(([k,v]) => `${k}: ${v}`)
    .join(', ');

  const prompt = `
You are a market analyst. Evaluate "${startupName}" in the ${domain} sector.
Metrics: ${metricSummary}.

1) Rate its success likelihood (0–100).  
2) Provide 1–2 actionable insights on how to improve its market chances and current market context.
`;
  try {
    const comp = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });
    const text = comp.choices?.[0]?.message?.content || '';
    const scoreMatch = text.match(/(\d{1,3})/);
    const score = scoreMatch ? Math.min(100,parseInt(scoreMatch[1])) : 50;

    const advice = text.replace(/^.*\n/, '').trim();

    const session = await MarketSession.create({
      user: req.userId,
      startupName,
      domain,
      metrics,
      score,
      advice,
    });
    res.json({ score, advice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Market validation failed.' });
  }
});

router.get('/history', auth, async (req, res) => {
  const history = await MarketSession.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(history);
});

module.exports = router;
