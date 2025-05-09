// client/src/components/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  ListGroup,
  Row,
  Col,
  Alert,
  Tabs,
  Tab,
  Spinner
} from 'react-bootstrap';
import axios from 'axios';

// axios instance with JWT interceptor
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Helper to compute pitch score from feedback (optional)
function computePitchScore({ structure, marketFit, readiness }) {
  let count = 0;
  if (structure) count++;
  if (marketFit) count++;
  if (readiness) count++;
  return Math.round((count / 3) * 100);
}

const Dashboard = () => {
  const [user, setUser] = useState(null);

  const [pitchHistory, setPitchHistory] = useState([]);
  const [qaHistory, setQaHistory] = useState([]);
  const [marketHistory, setMarketHistory] = useState([]);

  const [loading, setLoading] = useState({
    pitch: true,
    qa: true,
    market: true,
  });
  const [error, setError] = useState({
    pitch: '',
    qa: '',
    market: '',
  });

  useEffect(() => {
    // load user profile
    const u = JSON.parse(localStorage.getItem('user'));
    if (u) setUser(u);

    // fetch pitch analysis history
    API.get('/api/history')
      .then(({ data }) => setPitchHistory(data))
      .catch(err => setError(e => ({ ...e, pitch: 'Failed to load pitch history.' })))
      .finally(() => setLoading(l => ({ ...l, pitch: false })));

    // fetch Investor Q&A history
    API.get('/api/investor-qa/history')
      .then(({ data }) => setQaHistory(data))
      .catch(() => setError(e => ({ ...e, qa: 'Failed to load Q&A history.' })))
      .finally(() => setLoading(l => ({ ...l, qa: false })));

    // fetch Market Validation history
    API.get('/api/market-validate/history')
      .then(({ data }) => setMarketHistory(data))
      .catch(() => setError(e => ({ ...e, market: 'Failed to load market history.' })))
      .finally(() => setLoading(l => ({ ...l, market: false })));
  }, []);

  if (!user) {
    return <Alert variant="info">Loading profile…</Alert>;
  }

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
              <h3 className="mb-4">Your Activity</h3>
              <Tabs defaultActiveKey="pitch" id="dashboard-tabs">
                {/* Pitch Analysis Tab */}
                <Tab eventKey="pitch" title="Pitch Analysis">
                  {loading.pitch ? (
                    <Spinner animation="border" />
                  ) : error.pitch ? (
                    <Alert variant="danger">{error.pitch}</Alert>
                  ) : pitchHistory.length > 0 ? (
                    <ListGroup variant="flush" className="mt-3">
                      {pitchHistory.map(a => (
                        <ListGroup.Item key={a._id} className="py-3">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h5>{new Date(a.uploadedAt).toLocaleDateString()}</h5>
                              <p className="mb-1"><strong>File:</strong> {a.filename}</p>
                              <p className="mb-0 text-muted">
                                {a.feedback.structure.substring(0, 100)}…
                              </p>
                            </div>
                            <div className="text-primary fw-bold fs-4">
                              {computePitchScore(a.feedback)}%
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Alert variant="info" className="mt-3">
                      No pitch analyses yet. Upload a deck to get started!
                    </Alert>
                  )}
                </Tab>

                {/* Investor Q&A Tab */}
                <Tab eventKey="qa" title="Investor Q&A">
                  {loading.qa ? (
                    <Spinner animation="border" />
                  ) : error.qa ? (
                    <Alert variant="danger">{error.qa}</Alert>
                  ) : qaHistory.length > 0 ? (
                    <ListGroup variant="flush" className="mt-3">
                      {qaHistory.map(s => (
                        <ListGroup.Item key={s._id} className="py-3">
                          <h5>{new Date(s.createdAt).toLocaleDateString()}</h5>
                          <p className="mb-1">
                            <strong>Domain:</strong> {s.domain} &mdash; <strong>Stage:</strong> {s.fundingStage}
                          </p>
                          <p className="mb-1 text-muted">
                            {s.questions.slice(0, 3).join(' | ')}…
                          </p>
                          <small className="text-secondary">
                            {s.questions.length} questions generated
                          </small>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Alert variant="info" className="mt-3">
                      No Q&A sessions yet. Generate questions to see them here!
                    </Alert>
                  )}
                </Tab>

                {/* Market Validation Tab */}
                <Tab eventKey="market" title="Market Validation">
                  {loading.market ? (
                    <Spinner animation="border" />
                  ) : error.market ? (
                    <Alert variant="danger">{error.market}</Alert>
                  ) : marketHistory.length > 0 ? (
                    <ListGroup variant="flush" className="mt-3">
                      {marketHistory.map(s => (
                        <ListGroup.Item key={s._id} className="py-3">
                          <h5>{new Date(s.createdAt).toLocaleDateString()}</h5>
                          <p className="mb-1">
                            <strong>Domain:</strong> {s.domain}
                          </p>
                          <p className="mb-1 text-muted">
                            Score: <strong>{s.score}%</strong>
                          </p>
                          <p className="mb-0 text-muted">
                            {s.analysis.substring(0, 100)}…
                          </p>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Alert variant="info" className="mt-3">
                      No market validations yet. Validate metrics to see them here!
                    </Alert>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
