// server/routes/investorQA.js
const express = require('express');
const { OpenAI } = require('openai');
const auth = require('../middleware/auth');
const InvestorSession = require('../models/InvestorSession');

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// 1) Generate 10 questions
router.post('/', auth, async (req, res) => {
  const { investorType, fundingStage, domain } = req.body;
  if (!investorType || !fundingStage || !domain) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const prompt = `
You are an expert investor. 
Generate 10 concise questions that a ${investorType} investor would ask a startup in the ${domain} domain at the ${fundingStage} stage.
`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
    });
    const raw = completion.choices?.[0]?.message?.content || '';
    const questions = raw.split('\n').map(l => l.trim()).filter(l => l);

    const session = await InvestorSession.create({
      user: req.userId,
      investorType,
      fundingStage,
      domain,
      questions,
    });
    res.json({ sessionId: session._id, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate questions.' });
  }
});

// 2) Submit answer to one question and get AI feedback
router.post('/:sessionId/answer', auth, async (req, res) => {
  const { sessionId } = req.params;
  const { questionIndex, userAnswer } = req.body;
  if (typeof questionIndex !== 'number' || !userAnswer) {
    return res.status(400).json({ error: 'questionIndex and userAnswer required.' });
  }

  try {
    const session = await InvestorSession.findById(sessionId);
    if (!session || session.user.toString() !== req.userId) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    const question = session.questions[questionIndex];
    if (!question) {
      return res.status(400).json({ error: 'Invalid questionIndex.' });
    }

    const prompt = `
You are an expert investor.  Here is the question:
"${question}"

Here is the user’s answer:
"${userAnswer}"

Provide concise, constructive feedback on their answer and suggest improvements.
`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });
    const aiFeedback = completion.choices?.[0]?.message?.content || 'No feedback returned.';

    // save it
    session.answers.push({ question, userAnswer, aiFeedback });
    await session.save();

    res.json({ aiFeedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process answer.' });
  }
});

// 3) History
router.get('/history', auth, async (req, res) => {
  const history = await InvestorSession.find({ user: req.userId })
    .sort({ createdAt: -1 });
  res.json(history);
});

module.exports = router;

