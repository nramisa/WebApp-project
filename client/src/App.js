import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { AuthContext } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import StartupDashboard from './components/Dashboard/StartupDashboard';
import InvestorDashboard from './components/Dashboard/InvestorDashboard';
import Analysis from './components/Analysis';
import InvestorQA from './components/InvestorQA';
import MarketValidation from './components/MarketValidation';
import Upload from './components/Upload';
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
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/analyze">Analysis</Nav.Link>
                  <Nav.Link as={Link} to="/investor-qa">Q&A Simulator</Nav.Link>
                  <Nav.Link as={Link} to="/market-validation">Market Validation</Nav.Link>
                </>
              )}
              {auth.token && auth.role === 'investor' && (
                <Nav.Link as={Link} to="/investor-dashboard">Pitch Board</Nav.Link>
              )}
            </Nav>
            <Nav>
              {auth.token ? (
                <Button variant="danger" onClick={logout}>
                  Logout
                </Button>
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

            {/* Startup Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="startup">
                <StartupDashboard />
              </ProtectedRoute>
            }/>
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

            {/* Investor Routes */}
            <Route path="/investor-dashboard" element={
              <ProtectedRoute requiredRole="investor">
                <InvestorDashboard />
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
