// client/src/components/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Container, Card, ListGroup, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

// axios instance with JWT from localStorage
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Optional: compute an overall score based on your feedback schema
function computeScore({ structure, marketFit, readiness }) {
  // simple example: count non-empty sections / 3 * 100
  let count = 0;
  if (structure) count++;
  if (marketFit) count++;
  if (readiness) count++;
  return Math.round((count / 3) * 100);
}

const Dashboard = () => {
  const [user,      setUser]     = useState(null);
  const [analyses,  setAnalyses] = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [error,     setError]    = useState('');

  useEffect(() => {
    // load profile
    const u = JSON.parse(localStorage.getItem('user'));
    if (u) setUser(u);

    // fetch history
    API.get('/api/history')
      .then(({ data }) => {
        setAnalyses(data); // expects array of Analysis docs
      })
      .catch(err => {
        console.error('History fetch error:', err);
        setError('Could not load your analysis history.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (!user)    return <Alert variant="info">Loading profile…</Alert>;
  if (loading)  return <Alert variant="info">Loading history…</Alert>;
  if (error)    return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="my-5">
      <Row>
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h3 className="mb-4">Profile Overview</h3>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Startup:</strong> {user.startupName}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="mb-4">Recent Analyses</h3>

              {analyses.length > 0 ? (
                <ListGroup variant="flush">
                  {analyses.map(a => (
                    <ListGroup.Item key={a._id} className="py-3">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h5>{new Date(a.uploadedAt).toLocaleDateString()}</h5>
                          <p className="mb-1"><strong>File:</strong> {a.filename}</p>
                          <p className="mb-0 text-muted">
                            {a.feedback.structure}
                          </p>
                        </div>
                        <div className="text-danger fw-bold fs-4">
                          {computeScore(a.feedback)}%
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info">No analyses found. Upload your first pitch deck!</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
