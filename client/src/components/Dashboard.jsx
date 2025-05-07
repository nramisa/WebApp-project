import React, { useEffect, useState } from 'react';
import { Container, Card, ListGroup, Row, Col, Alert } from 'react-bootstrap';
// import styles from '../styles/Analysis.module.css';  ← removed since unused

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const mockAnalyses = [
      { id: 1, date: '2024-05-01', score: 82, summary: 'Strong team section but needs financial projections' },
      { id: 2, date: '2024-04-15', score: 75, summary: 'Good problem identification but lacks competitor analysis' }
    ];
    setUser(userData);
    setAnalyses(mockAnalyses);
  }, []);

  if (!user) return <Alert variant="info">Loading dashboard...</Alert>;

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
                  {analyses.map(analysis => (
                    <ListGroup.Item key={analysis.id} className="py-3">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h5>{analysis.date}</h5>
                          <p className="mb-0 text-muted">{analysis.summary}</p>
                        </div>
                        <div className="text-danger fw-bold fs-4">
                          {analysis.score}%
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

