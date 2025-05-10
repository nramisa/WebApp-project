import React from 'react';
import { Navbar, Container, Nav, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const PrivateNavbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  // grab the user object from localStorage
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : {};

  const handleLogout = () => {
    // clear localStorage and React state
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);

    // send user back to Home
    navigate('/');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/dashboard"
          className="text-danger fw-bold"
        >
          PitchIn
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/analyze">Analysis</Nav.Link>
            <Nav.Link as={Link} to="/market">Market Validation</Nav.Link>
            <Nav.Link as={Link} to="/qa">Investor Q&A</Nav.Link>
            {/* Admin Panel link only for admins */}
            {user.isAdmin && (
              <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>
            )}
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/dashboard">
              <Image
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                width="30"
                height="30"
                roundedCircle
                className="border profile-image"
              />
            </Nav.Link>
            <Nav.Link
              onClick={handleLogout}
              className="text-danger"
            >
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PrivateNavbar;
