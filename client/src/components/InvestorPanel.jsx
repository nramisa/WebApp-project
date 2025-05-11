import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const InvestorPanel = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    API.get('/api/investor/startups')  // this route we'll build next
      .then(res => setStartups(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold">Explore Startup Pitches</h2>
      {startups.length === 0 ? (
        <p>No startup decks available yet.</p>
      ) : (
        startups.map((s, i) => (
          <Card className="mb-4" key={i}>
            <Card.Body>
              <Card.Title>{s.startupName || 'Unnamed Startup'}</Card.Title>
              <Card.Text>{s.pitchSummary || 'No summary available.'}</Card.Text>
              <Button variant="primary">Connect</Button>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default InvestorPanel;
