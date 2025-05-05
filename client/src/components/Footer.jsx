import React from 'react';
import { Container, Row, Col } from 'react-bootstrap'; // Import Bootstrap components

const Footer = () => { //Functional component
  return (
    <footer className="bg-dark text-light py-4 mt-5"> {/* Dark background with padding */}
      <Container> {/* Responsive container */}
        <Row>

          {/* Bootstrap divides rows into 12 columns*/}
          <Col md={6}> {/* Left column */}
            <h5>Contact Us</h5>
            <p className="mb-1">support@pitchin.ai</p>
            <p>+1 (555) 123-4567</p>
          </Col>
          <Col md={6} className="text-md-end mt-4 mt-md-0"> {/* Right column, since text-md-end means its on the right side of the screen, here mt-4 means margin top of size 4 and its applied in mobile, mt-md-0 means no margin in medium screens like desktops */}
            <div className="social-icons mb-3">
              <a href="https://twitter.com/pitchin_ai" target="_blank" rel="noopener noreferrer" className="text-light mx-2">
              <i className="bi bi-twitter fs-4"></i></a>
              <a href="https://linkedin.com/company/pitchin-ai" target="_blank" rel="noopener noreferrer" className="text-light mx-2">
              <i className="bi bi-linkedin fs-4"></i></a>
            </div>
            <p className="mb-0">&copy; 2024 PitchIn. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; // Export component
