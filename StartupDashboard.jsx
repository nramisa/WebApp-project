import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const StartupDashboard = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Startup Dashboard</h2>
      
      <Row className="g-4">
        {/* Documents Section */}
        <Col md={8}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>My Pitch Documents</Card.Title>
              {/* Document list implementation */}
            </Card.Body>
          </Card>
        </Col>

        {/* Investor Matches */}
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Investor Matches</Card.Title>
              {/* Match list implementation */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StartupDashboard;