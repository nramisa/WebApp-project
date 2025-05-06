import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { AuthContext } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './components/Profile';
import Analysis from './components/Analysis';
import InvestorQA from './components/InvestorQA';
import MarketValidation from './components/MarketValidation';
import Upload from './components/Upload';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import './styles/base.css';

const App = () => {
  const { auth, logout } = useContext(AuthContext);

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!auth.token) return <Navigate to="/login" replace />;
    if (requiredRole && auth.role !== requiredRole) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Router>
      <Navbar bg="light" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="logo">
            <img src="/logo.png" alt="PitchIn" style={{ height: '40px' }} />
            PitchIn
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="main-nav" />
          
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              {auth.token && auth.role === 'startup' && (
                <>
                  <Nav.Link as={Link} to="/">Home</Nav.Link>
                  <Nav.Link as={Link} to="/analyze">Analysis</Nav.Link>
                  <Nav.Link as={Link} to="/investor-qa">Q&A Simulator</Nav.Link>
                  <Nav.Link as={Link} to="/market-validation">Market Validation</Nav.Link>
                </>
              )}
              {auth.token && auth.role === 'admin' && (
                <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>
              )}
            </Nav>
            
            <Nav>
              {auth.token ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" id="profile-dropdown">
                    <i className="bi bi-person-circle me-2"></i>
                    {auth.userData?.name || 'Profile'}
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      <i className="bi bi-person me-2"></i>
                      My Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="main-content">
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }/>

            {/* Startup Routes */}
            <Route path="/analyze" element={
              <ProtectedRoute requiredRole="startup">
                <Upload />
                <Analysis />
              </ProtectedRoute>
            }/>
            <Route path="/investor-qa" element={
              <ProtectedRoute requiredRole="startup">
                <InvestorQA />
              </ProtectedRoute>
            }/>
            <Route path="/market-validation" element={
              <ProtectedRoute requiredRole="startup">
                <MarketValidation />
              </ProtectedRoute>
            }/>

            {/* Admin Route */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }/>
          </Routes>
        </Container>
      </div>
      
      <Footer />
    </Router>
  );
};

export default App;
