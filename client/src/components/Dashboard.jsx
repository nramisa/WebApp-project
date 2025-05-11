import React, { useEffect, useState } from 'react';
import {
  Container, Card, Row, Col, Alert, Button, Spinner
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

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (u) setUser(u);
  }, []);

  const handleSave = async updates => {
    setLoading(true);
    try {
      const res = await API.patch('/api/user/me', updates);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      setEditing(false);
    } catch {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  const roleTitle = user.isAdmin
    ? 'Admin Profile'
    : user.isInvestor
    ? 'Investor Profile'
    : 'Profile Overview';

  return (
    <Container className={styles.dashboardContainer}>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className={styles.profileCard}>
            <Card.Body>
              <h3 className={styles.profileTitle}>{roleTitle}</h3>
              <div className={styles.profileSection}><label>Name</label><p>{user.name}</p></div>
              <div className={styles.profileSection}><label>Email</label><p>{user.email}</p></div>
              {!user.isAdmin && !user.isInvestor && (
                <div className={styles.profileSection}><label>Startup</label><p>{user.startupName || 'N/A'}</p></div>
              )}
              <div className="mt-3 text-center">
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              </div>
              {editing && (
                <EditProfileForm
                  initial={{ name: user.name, email: user.email }}
                  onSave={handleSave}
                  loading={loading}
                  onCancel={() => setEditing(false)}
                />
              )}
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
