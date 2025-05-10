import React, { useEffect, useState } from 'react';
import {
  Container, Card, Tabs, Tab, Table, Alert, Spinner
} from 'react-bootstrap';
import axios from 'axios';

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

  if (loading) return <Spinner animation="border" />;
  if (error)   return <Alert variant="danger" className="m-3">{error}</Alert>;

  return (
    <Container className="my-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4">Admin Dashboard</h3>
          <Tabs defaultActiveKey="users">
            <Tab eventKey="users" title="Users">
              <Table striped bordered hover size="sm" className="mt-3">
                <thead><tr><th>Name</th><th>Email</th><th>Startup</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.startupName}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="analyses" title="Pitch Analyses">
              <Table striped bordered hover size="sm" className="mt-3">
                <thead><tr><th>User</th><th>File</th><th>Date</th></tr></thead>
                <tbody>
                  {analyses.map(a => (
                    <tr key={a._id}>
                      <td>{a.user?.name}</td>
                      <td>{a.filename}</td>
                      <td>{new Date(a.uploadedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="qa" title="Investor Q&A">
              <Table striped bordered hover size="sm" className="mt-3">
                <thead><tr><th>User</th><th>Domain</th><th>Stage</th><th>Count</th></tr></thead>
                <tbody>
                  {qa.map(s => (
                    <tr key={s._id}>
                      <td>{s.user?.name}</td>
                      <td>{s.domain}</td>
                      <td>{s.fundingStage}</td>
                      <td>{s.questions.length}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="market" title="Market Validation">
              <Table striped bordered hover size="sm" className="mt-3">
                <thead><tr><th>User</th><th>Startup</th><th>Domain</th><th>Score</th></tr></thead>
                <tbody>
                  {market.map(m => (
                    <tr key={m._id}>
                      <td>{m.user?.name}</td>
                      <td>{m.startupName}</td>
                      <td>{m.domain}</td>
                      <td>{m.score}%</td>
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
