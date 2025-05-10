import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer 
      className="text-dark py-4"
      style={{
        backgroundColor: '#EDE6D6',
        marginTop: 'auto',
        position: 'relative',
        zIndex: 100
      }}
    >
      <Container>
        <Row>
          <Col md={6}>
            <h5>Contact Us</h5>
            <p className="mb-1">support@pitchin.ai</p>
            <p>+1 (555) 123-4567</p>
          </Col>
          <Col md={6} className="text-md-end mt-4 mt-md-0">
            <div className="social-icons mb-3">
              <a href="https://twitter.com/pitchin_ai" target="_blank" rel="noopener noreferrer" className="text-dark mx-2">
                <i className="bi bi-twitter fs-4"></i>
              </a>
              <a href="https://linkedin.com/company/pitchin-ai" target="_blank" rel="noopener noreferrer" className="text-dark mx-2">
                <i className="bi bi-linkedin fs-4"></i>
              </a>
            </div>
            <p className="mb-0">&copy; 2024 PitchIn. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
