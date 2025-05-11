import React, { useEffect, useState } from 'react';
import {
  Container, Card, Tabs, Tab, Table, Alert, Spinner, Badge, Button, Modal, Form
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
  const [users,   setUsers]   = useState([]);
  const [analyses,setAnalyses]= useState([]);
  const [qa,      setQa]      = useState([]);
  const [market,  setMarket]  = useState([]);
  const [error,   setError]   = useState('');

  // for editing user
  const [modalShow, setModalShow] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    (async () => {
      try {
        const [u,a,q,m] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/analyses'),
          api.get('/api/admin/qa'),
          api.get('/api/admin/market'),
        ]);
        setUsers(u.data);
        setAnalyses(a.data);
        setQa(q.data);
        setMarket(m.data);
      } catch {
        setError('Access denied or API error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // delete user
  const deleteUser = async id => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/api/admin/users/${id}`);
    setUsers(us => us.filter(u => u._id !== id));
  };

  // open edit modal
  const editUser = user => {
    setActiveUser(user);
    setFormData({ name: user.name, email: user.email });
    setModalShow(true);
  };

  // save edits
  const saveUser = async () => {
    const res = await api.patch(`/api/admin/users/${activeUser._id}`, formData);
    setUsers(us => us.map(u => u._id === res.data._id ? res.data : u));
    setModalShow(false);
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error)   return <Alert variant="danger" className="m-3">{error}</Alert>;

  return (
    <Container className={styles.dashboardContainer}>
      <Card className={styles.dashboardCard}>
        <Card.Body>
          <h3 className={styles.dashboardTitle}>Admin Dashboard</h3>
          <Tabs defaultActiveKey="users" className={styles.dashboardTabs}>

            {/* ─── USERS TAB ─────────────────────── */}
            <Tab eventKey="users" title="Users">
              <Table hover className={styles.dashboardTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Name</th><th>Email</th><th>Startup</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className={styles.tableRow}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.startupName}</td>
                      <td>
                        <Button size="sm" onClick={() => editUser(u)} className="me-2">
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => deleteUser(u._id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            {/* ─── PITCH ANALYSES ───────────────── */}
            <Tab eventKey="analyses" title="Pitch Analyses">
              <Table hover className={styles.dashboardTable}>
                <thead className={styles.tableHeader}>
                  <tr><th>User</th><th>File</th><th>Date</th></tr>
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

            {/* ─── INVESTOR Q&A ──────────────────── */}
            <Tab eventKey="qa" title="Investor Q&A">
              <Table hover className={styles.dashboardTable}>
                <thead className={styles.tableHeader}>
                  <tr><th>User</th><th>Domain</th><th>Stage</th><th>Count</th></tr>
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

            {/* ─── MARKET VALIDATION ─────────────── */}
            <Tab eventKey="market" title="Market Validation">
              <Table hover className={styles.dashboardTable}>
                <thead className={styles.tableHeader}>
                  <tr><th>User</th><th>Startup</th><th>Domain</th><th>Score</th></tr>
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

      {/* ─── EDIT USER MODAL ───────────────── */}
      <Modal show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={formData.name}
                onChange={e => setFormData(fd => ({ ...fd, name: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={e => setFormData(fd => ({ ...fd, email: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Cancel
          </Button>
          <Button onClick={saveUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
