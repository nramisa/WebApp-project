import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default function MarketValidation() {
  const [startupName, setStartupName] = useState('');
  const [domain, setDomain] = useState('Fintech');
  const [metrics, setMetrics] = useState({ users:0, revenue:0, growthRate:0 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await api.post('/api/market-validate', { startupName, domain, metrics });
    setResult(res.data);
    setLoading(false);
  };

  return (
    <Card>
      <Card.Body>
        <h4>Market Validation</h4>
        <Form.Group>
          <Form.Label>Startup Name</Form.Label>
          <Form.Control value={startupName} onChange={e=>setStartupName(e.target.value)} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Domain</Form.Label>
          <Form.Control as="select" value={domain} onChange={e=>setDomain(e.target.value)}>
            <option>Fintech</option><option>Healthtech</option><option>E-commerce</option>
          </Form.Control>
        </Form.Group>
        {/* Simple metric inputs */}
        {['users','revenue','growthRate'].map(key => (
          <Form.Group key={key}>
            <Form.Label>{key}</Form.Label>
            <Form.Control
              type="number"
              value={metrics[key]}
              onChange={e=>setMetrics(m=>({...m,[key]:e.target.value}))}
            />
          </Form.Group>
        ))}
        <Button className="mt-3" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm"/> : 'Validate Market'}
        </Button>

        {result && (
          <Alert variant="success" className="mt-3">
            <p><strong>Score:</strong> {result.score}%</p>
            <p><strong>Advice:</strong> {result.advice}</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}
