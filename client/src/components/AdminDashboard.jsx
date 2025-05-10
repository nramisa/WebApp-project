import React, { useEffect, useState } from 'react';
import {
  Container, Card, Tabs, Tab, Table, Alert, Spinner, Row, Col, Badge
} from 'react-bootstrap';
import axios from 'axios';
import styles from '../styles/dashboardStyles.module.css';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [qa, setQa] = useState([]);
  const [market, setMarket] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [u, a, q, m] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/analyses'),
          api.get('/api/admin/qa'),
          api.get('/api/admin/market'),
        ]);
        setUsers(u.data);
        setAnalyses(a.data);
        setQa(q.data);
        setMarket(m.data);
      } catch (err) {
        setError('Access denied or API error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger" className="m-3">{error}</Alert>;

  return (
    <Container className={styles.dashboardContainer}>
      <Card className={styles.dashboardCard}>
        <Card.Body>
          <div className={styles.headerSection}>
            <h3 className={styles.dashboardTitle}>Admin Dashboard</h3>
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span>Users</span>
                <Badge bg="danger" className={styles.statBadge}>{users.length}</Badge>
              </div>
              <div className={styles.statBox}>
                <span>Analyses</span>
                <Badge bg="danger" className={styles.statBadge}>{analyses.length}</Badge>
              </div>
              <div className={styles.statBox}>
                <span>Q&A Sessions</span>
                <Badge bg="danger" className={styles.statBadge}>{qa.length}</Badge>
              </div>
              <div className={styles.statBox}>
                <span>Market Checks</span>
                <Badge bg="danger" className={styles.statBadge}>{market.length}</Badge>
              </div>
            </div>
          </div>

          <Tabs defaultActiveKey="users" className={styles.dashboardTabs}>
            <Tab eventKey="users" title="Users" className={styles.tabContent}>
              <Table hover className={styles.dashboardTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Startup</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className={styles.tableRow}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.startupName}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="analyses" title="Pitch Analyses" className={styles.tabContent}>
              <Table hover className={styles.dashboardTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>User</th>
                    <th>File</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map(a => (
                    <tr key={a._id} className={styles.tableRow}>
                      <td>{a.user?.name}</td>
                      <td>{a.filename}</td>
                      <td>{new Date(a.uploadedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="qa" title="Investor Q&A" className={styles.tabContent}>
              <Table hover className={styles.dashboardTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>User</th>
                    <th>Domain</th>
                    <th>Stage</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {qa.map(s => (
                    <tr key={s._id} className={styles.tableRow}>
                      <td>{s.user?.name}</td>
                      <td>{s.domain}</td>
                      <td>{s.fundingStage}</td>
                      <td>{s.questions.length}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="market" title="Market Validation" className={styles.tabContent}>
              <Table hover className={styles.dashboardTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>User</th>
                    <th>Startup</th>
                    <th>Domain</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {market.map(m => (
                    <tr key={m._id} className={styles.tableRow}>
                      <td>{m.user?.name}</td>
                      <td>{m.startupName}</td>
                      <td>{m.domain}</td>
                      <td><Badge bg="danger">{m.score}%</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
}
