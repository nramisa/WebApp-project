// client/src/components/InvestorQA.jsx

import React, { useState, useEffect } from 'react';
import { Form, Button, Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default function InvestorQA() {
  const [investorType, setInvestorType] = useState('VC');
  const [fundingStage, setFundingStage] = useState('Seed');
  const [domain, setDomain] = useState('Fintech');

  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]); // {question,userAnswer,aiFeedback}

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  // generate questions
  const startSession = async () => {
    setLoading(true);
    const res = await api.post('/api/investor-qa', { investorType, fundingStage, domain });
    setSessionId(res.data.sessionId);
    setQuestions(res.data.questions);
    setAnswers([]);
    setCurrentIndex(0);
    setUserAnswer('');
    setLoading(false);
  };

  // submit one answer
  const submitAnswer = async () => {
    setLoading(true);
    const res = await api.post(`/api/investor-qa/${sessionId}/answer`, {
      questionIndex: currentIndex,
      userAnswer
    });
    setAnswers(a => [...a, {
      question: questions[currentIndex],
      userAnswer,
      aiFeedback: res.data.aiFeedback
    }]);
    setUserAnswer('');
    setCurrentIndex(i => i + 1);
    setLoading(false);
  };

  if (loading) return <Spinner animation="border" />;
  if (!sessionId && !questions.length) {
    return (
      <Card>
        <Card.Body>
          <h4>Start Investor Q&A</h4>
          <Form>
            {/* dropdowns for investorType, fundingStage, domain */}
            <Form.Group>
              <Form.Label>Investor Type</Form.Label>
              <Form.Control as="select" value={investorType} onChange={e=>setInvestorType(e.target.value)}>
                <option>VC</option><option>Angel</option><option>Corporate</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Funding Stage</Form.Label>
              <Form.Control as="select" value={fundingStage} onChange={e=>setFundingStage(e.target.value)}>
                <option>Pre-Seed</option><option>Seed</option><option>Series A</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Domain</Form.Label>
              <Form.Control as="select" value={domain} onChange={e=>setDomain(e.target.value)}>
                <option>Fintech</option><option>Healthtech</option><option>E-commerce</option>
              </Form.Control>
            </Form.Group>
            <Button onClick={startSession} className="mt-3">Generate Questions</Button>
          </Form>
        </Card.Body>
      </Card>
    );
  }

  if (currentIndex < questions.length) {
    const q = questions[currentIndex];
    return (
      <Card>
        <Card.Body>
          <h5>Question {currentIndex+1}/{questions.length}</h5>
          <p>{q}</p>
          <Form.Control
            as="textarea" rows={3}
            value={userAnswer}
            onChange={e=>setUserAnswer(e.target.value)}
          />
          <Button className="mt-3" onClick={submitAnswer} disabled={!userAnswer}>Submit Answer</Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <h4>Review Your Answers & Feedback</h4>
      <ListGroup>
        {answers.map((a,i) => (
          <ListGroup.Item key={i}>
            <p><strong>Q:</strong> {a.question}</p>
            <p><strong>Your answer:</strong> {a.userAnswer}</p>
            <p><strong>Feedback:</strong> {a.aiFeedback}</p>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}
