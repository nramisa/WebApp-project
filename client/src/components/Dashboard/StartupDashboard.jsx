import React, { useContext } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

const StartupDashboard = () => {
  const { auth } = useContext(AuthContext);

  // Mock data - replace with API calls
  const mockData = {
    progress: {
      analyses: 3,
      investorContacts: 2,
      qaSessions: 5
    },
    recentFeedback: [
      { id: 1, score: 78, date: '2024-03-15', link: '/analyze' },
      { id: 2, score: 85, date: '2024-03-14', link: '/analyze' }
    ],
    investorContacts: [
      { id: 1, name: 'VC Firm A', date: '2024-03-14', status: 'Pending' },
      { id: 2, name: 'Angel Investor B', date: '2024-03-13', status: 'Contacted' }
    ]
  };

  return (
    <Container className="mt-4">
      <h2>Welcome Back, {auth.userData?.name || 'Founder'}</h2>
      <p className="text-muted mb-4">Your startup journey at a glance</p>
      
      <Row className="g-4">
        {/* Progress Summary */}
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="mb-4">Progress Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Analyses Completed</span>
                  <Badge bg="danger" pill>{mockData.progress.analyses}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Investor Contacts</span>
                  <Badge bg="danger" pill>{mockData.progress.investorContacts}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Q&A Sessions</span>
                  <Badge bg="danger" pill>{mockData.progress.qaSessions}</Badge>
                </ListGroup.Item>
              </ListGroup>
              <Button 
                variant="danger" 
                className="mt-4 w-100"
                as={Link}
                to="/analyze"
              >
                New Analysis
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-4">Recent Feedback</Card.Title>
              <ListGroup variant="flush">
                {mockData.recentFeedback.map((feedback) => (
                  <ListGroup.Item 
                    key={feedback.id}
                    as={Link}
                    to={feedback.link}
                    className="text-decoration-none text-dark hover-primary"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">Analysis from {feedback.date}</h5>
                        <small className="text-muted">Click to view details</small>
                      </div>
                      <Badge bg="danger" pill>{feedback.score}%</Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mt-4 shadow-sm">
            <Card.Body>
              <Card.Title className="mb-4">Investor Interactions</Card.Title>
              <ListGroup variant="flush">
                {mockData.investorContacts.map((contact) => (
                  <ListGroup.Item key={contact.id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">{contact.name}</h5>
                        <small className="text-muted">{contact.date}</small>
                      </div>
                      <Badge bg={contact.status === 'Pending' ? 'warning' : 'success'}>
                        {contact.status}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StartupDashboard;
