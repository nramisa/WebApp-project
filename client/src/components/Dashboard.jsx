import React, { useEffect, useState } from 'react';
import {
  Container, Card, ListGroup, Row, Col, Alert, Tabs, Tab, Spinner, Badge
} from 'react-bootstrap';
import axios from 'axios';
import styles from '../styles/dashboardStyles.module.css';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

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
  const [loading, setLoading] = useState({ pitch: true, qa: true, market: true });
  const [error, setError] = useState({ pitch: '', qa: '', market: '' });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (u) setUser(u);

    API.get('/api/history')
      .then(({ data }) => setPitchHistory(data))
      .catch(err => setError(e => ({ ...e, pitch: 'Failed to load pitch history.' })))
      .finally(() => setLoading(l => ({ ...l, pitch: false })));

    API.get('/api/investor-qa/history')
      .then(({ data }) => setQaHistory(data))
      .catch(() => setError(e => ({ ...e, qa: 'Failed to load Q&A history.' })))
      .finally(() => setLoading(l => ({ ...l, qa: false })));

    API.get('/api/market-validate/history')
      .then(({ data }) => setMarketHistory(data))
      .catch(() => setError(e => ({ ...e, market: 'Failed to load market history.' })))
      .finally(() => setLoading(l => ({ ...l, market: false })));
  }, []);

  if (!user) return <Alert variant="info" className="mt-4">Loading profile…</Alert>;

  return (
    <Container className={styles.dashboardContainer}>
      <Row>
        <Col md={4}>
          <Card className={styles.profileCard}>
            <Card.Body>
              <h3 className={styles.profileTitle}>Profile Overview</h3>
              <div className={styles.profileSection}>
                <label>Name</label>
                <p>{user.name}</p>
              </div>
              <div className={styles.profileSection}>
                <label>Email</label>
                <p className={styles.emailText}>{user.email}</p>
              </div>
              <div className={styles.profileSection}>
                <label>Startup</label>
                <p>{user.startupName || 'Not specified'}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className={styles.activityCard}>
            <Card.Body>
              <h3 className={styles.activityTitle}>Your Activity</h3>
              <Tabs defaultActiveKey="pitch" className={styles.dashboardTabs}>
                <Tab eventKey="pitch" title={
                  <span>Pitch Analysis <Badge bg="danger">{pitchHistory.length}</Badge></span>
                }>
                  {loading.pitch ? (
                    <div className="text-center py-4"><Spinner animation="border" variant="danger" /></div>
                  ) : error.pitch ? (
                    <Alert variant="danger">{error.pitch}</Alert>
                  ) : pitchHistory.length > 0 ? (
                    <ListGroup variant="flush" className={styles.activityList}>
                      {pitchHistory.map((a, i) => {
                        const feedback = a.feedback || a.analysis?.feedback;
                        return (
                          <ListGroup.Item key={a._id || i} className={styles.listItem}>
                            <div className={styles.itemContent}>
                              <div className={styles.itemMain}>
                                <div className={styles.itemHeader}>
                                  <Badge bg="light" text="dark" className={styles.dateBadge}>
                                    {new Date(a.uploadedAt || a.createdAt).toLocaleDateString()}
                                  </Badge>
                                  <span className={styles.fileName}>{a.filename || 'N/A'}</span>
                                </div>
                                <p className={styles.feedbackText}>
                                  {feedback?.structure?.substring(0, 100) || 'No feedback available'}…
                                </p>
                              </div>
                              <Badge bg="danger" className={styles.scoreBadge}>
                                {feedback ? computePitchScore(feedback) + '%' : 'N/A'}
                              </Badge>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  ) : (
                    <Alert variant="info" className="mt-3">
                      No pitch analyses yet
                    </Alert>
                  )}
                </Tab>

                {/* Investor Q&A Tab */}
  <Tab eventKey="qa" title={<span>Investor Q&A <Badge bg="danger">{qaHistory.length}</Badge></span>}>
    {loading.qa ? (
      <div className="text-center py-4"><Spinner animation="border" variant="danger" /></div>
    ) : error.qa ? (
      <Alert variant="danger">{error.qa}</Alert>
    ) : qaHistory.length > 0 ? (
      <ListGroup variant="flush" className={styles.activityList}>
        {qaHistory.map(s => (
          <ListGroup.Item key={s._id} className={styles.listItem}>
            <div className={styles.itemContent}>
              <div className={styles.itemMain}>
                <div className={styles.itemHeader}>
                  <Badge bg="light" text="dark" className={styles.dateBadge}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </Badge>
                  <span className={styles.fileName}>{s.domain}</span>
                </div>
                <p className={styles.feedbackText}>
                  {s.questions?.slice(0, 3).join(' | ') || 'No questions'}…
                </p>
                <small className="text-secondary">
                  {s.questions?.length || 0} questions
                </small>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    ) : (
      <Alert variant="info" className="mt-3">
        No Q&A sessions yet
      </Alert>
    )}
  </Tab>

  {/* Market Validation Tab */}
  <Tab eventKey="market" title={<span>Market Validation <Badge bg="danger">{marketHistory.length}</Badge></span>}>
    {loading.market ? (
      <div className="text-center py-4"><Spinner animation="border" variant="danger" /></div>
    ) : error.market ? (
      <Alert variant="danger">{error.market}</Alert>
    ) : marketHistory.length > 0 ? (
      <ListGroup variant="flush" className={styles.activityList}>
        {marketHistory.map(s => (
          <ListGroup.Item key={s._id} className={styles.listItem}>
            <div className={styles.itemContent}>
              <div className={styles.itemMain}>
                <div className={styles.itemHeader}>
                  <Badge bg="light" text="dark" className={styles.dateBadge}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </Badge>
                  <span className={styles.fileName}>{s.startupName}</span>
                </div>
                <p className={styles.feedbackText}>
                  Score: <strong>{s.score}%</strong> - {s.advice?.substring(0, 100) || 'No advice'}…
                </p>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    ) : (
      <Alert variant="info" className="mt-3">
        No market validations yet
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
