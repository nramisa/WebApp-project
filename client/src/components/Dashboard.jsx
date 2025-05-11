import React, { useEffect, useState } from 'react';
import { Container, Card, ListGroup, Row, Col, Alert, Tabs, Tab, Spinner, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import EditProfileForm from './EditProfileForm';
import styles from '../styles/dashboardStyles.module.css';

// axios instance with JWT interceptor
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Helper to compute pitch score
function computePitchScore({ structure, marketFit, readiness }) {
  let count = 0;
  if (structure) count++;
  if (marketFit) count++;
  if (readiness) count++;
  return Math.round((count / 3) * 100);
}

const Dashboard = () => {
  const [user, setUser] = useState(null);

  // non-admin histories
  const [pitchHistory, setPitchHistory] = useState([]);
  const [qaHistory, setQaHistory] = useState([]);
  const [marketHistory, setMarketHistory] = useState([]);

  const [loading, setLoading] = useState({
    pitch: true,
    qa: true,
    market: true,
    user: false
  });
  const [error, setError] = useState({
    pitch: '',
    qa: '',
    market: '',
    user: ''
  });

  // edit state
  const [editing, setEditing] = useState(false);

  // load profile & histories
  useEffect(() => {
    // load profile
    const u = JSON.parse(localStorage.getItem('user'));
    if (u) setUser(u);

    // only fetch histories for non-admins
    if (!u?.isAdmin) {
      API.get('/api/history')
        .then(({ data }) => setPitchHistory(data))
        .catch(() => setError(e => ({ ...e, pitch: 'Failed to load pitch history.' })))
        .finally(() => setLoading(l => ({ ...l, pitch: false })));

      API.get('/api/investor-qa/history')
        .then(({ data }) => setQaHistory(data))
        .catch(() => setError(e => ({ ...e, qa: 'Failed to load Q&A history.' })))
        .finally(() => setLoading(l => ({ ...l, qa: false })));

      API.get('/api/market-validate/history')
        .then(({ data }) => setMarketHistory(data))
        .catch(() => setError(e => ({ ...e, market: 'Failed to load market history.' })))
        .finally(() => setLoading(l => ({ ...l, market: false })));
    }
  }, []);

  // handle profile save
  const handleSave = async updates => {
    setLoading(l => ({ ...l, user: true }));
    try {
      const res = await API.patch('/api/user/me', updates);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      setEditing(false);
    } catch {
      setError(e => ({ ...e, user: 'Failed to update profile.' }));
    } finally {
      setLoading(l => ({ ...l, user: false }));
    }
  };

  if (!user) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  // ─── Admin view ───
  if (user.isAdmin) {
    return (
      <Container className={styles.dashboardContainer}>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className={styles.profileCard}>
              <Card.Body>
                <h3 className={styles.profileTitle}>Admin Profile</h3>
                <div className={styles.profileSection}>
                  <label>Name</label>
                  <p>{user.name}</p>
                </div>
                <div className={styles.profileSection}>
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="mt-3 text-center">
                  <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                </div>
                {editing && (
                  <EditProfileForm
                    initial={{ name: user.name, email: user.email }}
                    onSave={handleSave}
                    loading={loading.user}
                    onCancel={() => setEditing(false)}
                  />
                )}
                {error.user && <Alert variant="danger" className="mt-3">{error.user}</Alert>}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // ─── Non-admin view ───
  return (
    <Container className={styles.dashboardContainer}>
      <Row>
        {/* Profile Column */}
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

        {/* Activity Column */}
        <Col md={8}>
          <Card className={styles.activityCard}>
            <Card.Body>
              <h3 className={styles.activityTitle}>Your Activity</h3>
              <Tabs defaultActiveKey="pitch" className={styles.dashboardTabs}>
                {/* Pitch Analysis */}
                <Tab eventKey="pitch" title={<span>Pitch Analysis <Badge bg="danger">{pitchHistory.length}</Badge></span>}>
                  {loading.pitch ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : error.pitch ? (
                    <Alert variant="danger">{error.pitch}</Alert>
                  ) : pitchHistory.length > 0 ? (
                    <ListGroup variant="flush" className={styles.activityList}>
                      {pitchHistory.map(a => {
                        const fb = a.feedback || a.analysis?.feedback;
                        return (
                          <ListGroup.Item key={a._id} className={styles.listItem}>
                            <div className={styles.itemContent}>
                              <div>
                                <div className={styles.itemHeader}>
                                  <Badge bg="light" text="dark" className={styles.dateBadge}>
                                    {new Date(a.uploadedAt).toLocaleDateString()}
                                  </Badge>
                                  <span className={styles.fileName}>{a.filename}</span>
                                </div>
                                <p className={styles.feedbackText}>
                                  {fb?.structure?.substring(0, 100) || 'No feedback available'}…
                                </p>
                              </div>
                              <Badge bg="danger" className={styles.scoreBadge}>
                                {fb ? computePitchScore(fb) + '%' : 'N/A'}
                              </Badge>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  ) : (
                    <Alert variant="info" className="mt-3">
                      No pitch analyses yet. Upload a deck to get started!
                    </Alert>
                  )}
                </Tab>

                {/* Investor Q&A */}
                <Tab eventKey="qa" title={<span>Investor Q&A <Badge bg="danger">{qaHistory.length}</Badge></span>}>
                  {loading.qa ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : error.qa ? (
                    <Alert variant="danger">{error.qa}</Alert>
                  ) : qaHistory.length > 0 ? (
                    <ListGroup variant="flush" className={styles.activityList}>
                      {qaHistory.map(s => (
                        <ListGroup.Item key={s._id} className={styles.listItem}>
                          <div>
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
                              {s.questions?.length || 0} questions generated
                            </small>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Alert variant="info" className="mt-3">
                      No Q&A sessions yet. Generate questions to see them here!
                    </Alert>
                  )}
                </Tab>

                {/* Market Validation */}
                <Tab eventKey="market" title={<span>Market Validation <Badge bg="danger">{marketHistory.length}</Badge></span>}>
                  {loading.market ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : error.market ? (
                    <Alert variant="danger">{error.market}</Alert>
                  ) : marketHistory.length > 0 ? (
                    <ListGroup variant="flush" className={styles.activityList}>
                      {marketHistory.map(s => (
                        <ListGroup.Item key={s._id} className={styles.listItem}>
                          <div>
                            <div className={styles.itemHeader}>
                              <Badge bg="light" text="dark" className={styles.dateBadge}>
                                {new Date(s.createdAt).toLocaleDateString()}
                              </Badge>
                              <span className={styles.fileName}>{s.startupName}</span>
                            </div>
                            <p className={styles.feedbackText}>
                              Score: <strong>{s.score}%</strong> – {s.advice?.substring(0, 100) || 'No advice'}…
                            </p>
                          </div>
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
