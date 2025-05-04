import React from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';

const InvestorDashboard = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Investor Dashboard</h2>
      
      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Preferences</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Investment Range</Form.Label>
                  <Form.Select>
                    <option>$50k - $100k</option>
                    <option>$100k - $500k</option>
                    <option>$500k+</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Recommended Startups</Card.Title>
              {/* Startup list implementation */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InvestorDashboard;