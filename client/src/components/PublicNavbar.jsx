import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PublicNavbar = () => (
  <Navbar bg="white" expand="lg" className="shadow-sm">
    <Container>
      <Navbar.Brand as={Link} to="/" className="text-danger fw-bold">
        PitchIn
      </Navbar.Brand>
      <Nav className="ms-auto">
        <Nav.Link as={Link} to="/signup" className="nav-link-custom mx-2">Sign Up</Nav.Link>
        <Nav.Link as={Link} to="/login" className="nav-link-custom mx-2">Login</Nav.Link>
      </Nav>
    </Container>
  </Navbar>
);

export default PublicNavbar;
