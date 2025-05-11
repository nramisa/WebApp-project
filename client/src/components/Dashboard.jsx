import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, ListGroup, Tabs, Tab, Alert,
  Spinner, Badge, Button, Modal
} from 'react-bootstrap';
import axios from 'axios';
import EditProfileForm from './EditProfileForm';
import styles from '../styles/dashboardStyles.module.css';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });
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

export default function Dashboard() {
  const [user, setUser] = useState(null);

  // For founders
  const [pitchHistory, setPitchHistory]   = useState([]);
  const [qaHistory,    setQaHistory]      = useState([]);
  const [marketHistory,setMarketHistory]  = useState([]);
  const [loading,      setLoading]        = useState({
    profile: false,
    pitch: true,
    qa: true,
    market: true
  });
  const [error, setError] = useState({
    profile: '',
    pitch: '',
    qa: '',
    market: ''
  });

  // Profile editing & detail modal (shared by founders)
  const [editing, setEditing] = useState(false);
  const [detail, setDetail]   = useState({ show: false, type: '', data: null });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (!u) return;
    setUser(u);

    // Only load full histories for **founders** (not admins, not investors)
    if (!u.isAdmin && !u.isInvestor) {
      API.get('/api/history')
        .then(r => setPitchHistory(r.data))
        .catch(() => setError(e => ({ ...e, pitch: 'Failed to load pitch history.' })))
        .finally(() => setLoading(l => ({ ...l, pitch: false })));

      API.get('/api/investor-qa/history')
        .then(r => setQaHistory(r.data))
        .catch(() => setError(e => ({ ...e, qa: 'Failed to load Q&A history.' })))
        .finally(() => setLoading(l => ({ ...l, qa: false })));

      API.get('/api/market-validate/history')
        .then(r => setMarketHistory(r.data))
        .catch(() => setError(e => ({ ...e, market: 'Failed to load market history.' })))
        .finally(() => setLoading(l => ({ ...l, market: false })));
    }
  }, []);

  const handleSave = async updates => {
    setLoading(l => ({ ...l, profile: true }));
    try {
      const res = await API.patch('/api/user/me', updates);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      setEditing(false);
    } catch {
      setError(e => ({ ...e, profile: 'Failed to update profile.' }));
    } finally {
      setLoading(l => ({ ...l, profile: false }));
    }
  };

  // 1) Loading
  if (!user) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  // 2) Admin: profile only
  if (user.isAdmin) {
    return (
      <Container className={styles.dashboardContainer}>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className={styles.profileCard}>
              <Card.Body>
                <h3 className={styles.profileTitle}>Admin Profile</h3>
                <div className={styles.profileSection}><label>Name</label><p>{user.name}</p></div>
                <div className={styles.profileSection}><label>Email</label><p>{user.email}</p></div>
                <div className="mt-3 text-center">
                  <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                </div>
                {editing && (
                  <EditProfileForm
                    initial={{ name: user.name, email: user.email }}
                    onSave={handleSave}
                    loading={loading.profile}
                    onCancel={() => setEditing(false)}
                  />
                )}
                {error.profile && <Alert variant="danger" className="mt-3">{error.profile}</Alert>}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // 3) Investor: profile only
  if (user.isInvestor) {
    return (
      <Container className={styles.dashboardContainer}>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className={styles.profileCard}>
              <Card.Body>
                <h3 className={styles.profileTitle}>Investor Profile</h3>
                <div className={styles.profileSection}><label>Name</label><p>{user.name}</p></div>
                <div className={styles.profileSection}><label>Email</label><p>{user.email}</p></div>
                <div className="mt-3 text-center">
                  <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                </div>
                {editing && (
                  <EditProfileForm
                    initial={{ name: user.name, email: user.email }}
                    onSave={handleSave}
                    loading={loading.profile}
                    onCancel={() => setEditing(false)}
                  />
                )}
                {error.profile && <Alert variant="danger" className="mt-3">{error.profile}</Alert>}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // 4) Founder: full activity dashboard
  return (
    <Container className={styles.dashboardContainer}>
      <Row>
        {/* Profile & Edit */}
        <Col md={4}>
          <Card className={styles.profileCard}>
            <Card.Body>
              <h3 className={styles.profileTitle}>Profile Overview</h3>
              <div className={styles.profileSection}><label>Name</label><p>{user.name}</p></div>
              <div className={styles.profileSection}><label>Email</label><p>{user.email}</p></div>
              <div className={styles.profileSection}><label>Startup</label><p>{user.startupName || 'N/A'}</p></div>
              <Button size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>
              {editing && (
                <EditProfileForm
                  initial={{ name: user.name, email: user.email }}
                  onSave={handleSave}
                  loading={loading.profile}
                  onCancel={() => setEditing(false)}
                />
              )}
              {error.profile && <Alert variant="danger" className="mt-2">{error.profile}</Alert>}
            </Card.Body>
          </Card>
        </Col>

        {/* Activity */}
        <Col md={8}>
          <Card className={styles.activityCard}>
            <Card.Body>
              <h3 className={styles.activityTitle}>Your Activity</h3>
              <Tabs defaultActiveKey="pitch" className={styles.dashboardTabs}>

                {/* Pitch Analysis */}
                <Tab eventKey="pitch"
                     title={<span>Pitch Analysis <Badge bg="danger">{pitchHistory.length}</Badge></span>}>
                  {loading.pitch
                    ? <div className="text-center py-4"><Spinner /></div>
                    : error.pitch
                      ? <Alert variant="danger">{error.pitch}</Alert>
                      : pitchHistory.length > 0
                        ? <ListGroup variant="flush" className={styles.activityList}>
                            {pitchHistory.map(a => (
                              <ListGroup.Item key={a._id}
                                              action
                                              className={styles.listItem}
                                              onClick={() => setDetail({ show: true, type: 'pitch', data: a })}>
                                <div className={styles.itemHeader}>
                                  <Badge bg="light" text="dark">
                                    {new Date(a.uploadedAt).toLocaleDateString()}
                                  </Badge>
                                  <span className={styles.fileName}>{a.filename}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <p className={styles.feedbackText}>
                                    {a.feedback?.structure?.substring(0,50)}…
                                  </p>
                                  <Badge bg="danger" className={styles.scoreBadge}>
                                    {computePitchScore(a.feedback)}%
                                  </Badge>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        : <Alert variant="info" className="mt-3">No pitch analyses yet.</Alert>
                  }
                </Tab>

                {/* Investor Q&A */}
                <Tab eventKey="qa"
                     title={<span>Investor Q&A <Badge bg="danger">{qaHistory.length}</Badge></span>}>
                  {loading.qa
                    ? <div className="text-center py-4"><Spinner /></div>
                    : error.qa
                      ? <Alert variant="danger">{error.qa}</Alert>
                      : qaHistory.length > 0
                        ? <ListGroup variant="flush" className={styles.activityList}>
                            {qaHistory.map(s => (
                              <ListGroup.Item key={s._id}
                                              action
                                              className={styles.listItem}
                                              onClick={() => setDetail({ show: true, type: 'qa', data: s })}>
                                <div className={styles.itemHeader}>
                                  <Badge bg="light" text="dark">
                                    {new Date(s.createdAt).toLocaleDateString()}
                                  </Badge>
                                  <span className={styles.fileName}>{s.domain}</span>
                                </div>
                                <p className={styles.feedbackText}>
                                  {s.questions.slice(0,3).join(' | ')}…
                                </p>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        : <Alert variant="info" className="mt-3">No Q&A sessions yet.</Alert>
                  }
                </Tab>

                {/* Market Validation */}
                <Tab eventKey="market"
                     title={<span>Market Validation <Badge bg="danger">{marketHistory.length}</Badge></span>}>
                  {loading.market
                    ? <div className="text-center py-4"><Spinner /></div>
                    : error.market
                      ? <Alert variant="danger">{error.market}</Alert>
                      : marketHistory.length > 0
                        ? <ListGroup variant="flush" className={styles.activityList}>
                            {marketHistory.map(s => (
                              <ListGroup.Item key={s._id}
                                              action
                                              className={styles.listItem}
                                              onClick={() => setDetail({ show: true, type: 'market', data: s })}>
                                <div className={styles.itemHeader}>
                                  <Badge bg="light" text="dark">
                                    {new Date(s.createdAt).toLocaleDateString()}
                                  </Badge>
                                  <span className={styles.fileName}>{s.startupName}</span>
                                </div>
                                <p className={styles.feedbackText}>
                                  Score: <strong>{s.score}%</strong> – {s.advice.substring(0,50)}…
                                </p>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        : <Alert variant="info" className="mt-3">No market validations yet.</Alert>
                  }
                </Tab>

              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        show={detail.show}
        onHide={() => setDetail({ show: false, type: '', data: null })}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {detail.type === 'pitch' ? 'Pitch Analysis Details'
             : detail.type === 'qa'    ? 'Investor Q&A Details'
             : 'Market Validation Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detail.type === 'pitch' && detail.data && (
            <>
              <h5>Structure</h5>
              <p>{detail.data.feedback.structure}</p>
              <h5>Market Fit</h5>
              <p>{detail.data.feedback.marketFit}</p>
              <h5>Readiness</h5>
              <p>{detail.data.feedback.readiness}</p>
            </>
          )}
          {detail.type === 'qa' && detail.data && (
            detail.data.answers.map((ans,i) => (
              <div key={i} className="mb-3">
                <p><strong>Q:</strong> {ans.question}</p>
                <p><strong>Your Answer:</strong> {ans.userAnswer}</p>
                <p><strong>Feedback:</strong> {ans.aiFeedback}</p>
                <hr />
              </div>
            ))
          )}
          {detail.type === 'market' && detail.data && (
            <>
              <p><strong>Startup:</strong> {detail.data.startupName}</p>
              <p><strong>Domain:</strong> {detail.data.domain}</p>
              <p><strong>Metrics:</strong> {JSON.stringify(detail.data.metrics)}</p>
              <p><strong>Score:</strong> {detail.data.score}%</p>
              <h5>Advice</h5>
              <p>{detail.data.advice}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
