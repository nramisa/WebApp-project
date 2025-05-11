import React from 'react';
import { Navbar, Container, Nav, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const PrivateNavbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : {};

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand className="text-danger fw-bold" style={{ cursor: 'default' }}>
          PitchIn
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">

          <Nav className="me-auto">
            {user.isAdmin
              // ─── ADMIN ONLY ─────────────────────────
              ? <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>
              // ─── NORMAL USER LINKS ───────────────────
              : (
                <>
                  <Nav.Link as={Link} to="/analyze">Analysis</Nav.Link>
                  <Nav.Link as={Link} to="/market">Market Validation</Nav.Link>
                  <Nav.Link as={Link} to="/qa">Investor Q&A</Nav.Link>
                </>
              )
            }
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
            <Nav.Link onClick={handleLogout} className="text-danger">
              Logout
            </Nav.Link>
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PrivateNavbar;
