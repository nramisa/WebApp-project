import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Upload from './components/Upload';
import Analysis from './components/Analysis';
import Login from './components/Auth/Login';
import Home from './components/Home';
import Footer from './components/Footer';
import AdminPanel from './components/Admin/AdminPanel';
import InvestorDashboard from './components/Dashboard/InvestorDashboard';
import StartupDashboard from './components/Dashboard/StartupDashboard';

const App = () => {
  const { auth } = useContext(AuthContext);
  const [analysisData, setAnalysisData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!auth.token) return <Navigate to="/login" replace />;
    if (requiredRole && auth.role !== requiredRole) return <Navigate to="/" replace />;
    return children;
  };

  const handleUpload = async (file) => {
    setLoading(true);
    try {
      const mockAnalysis = {
        score: Math.floor(Math.random() * 40) + 60,
        feedback: {
          structure: "Good structure overall",
          marketFit: "Strong market potential",
          financials: "Needs clearer projections"
        }
      };
      setAnalysisData(mockAnalysis);
    } catch (error) {
      alert('Upload failed');
    }
    setLoading(false);
  };

  return (
    <Router>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">PitchIn</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {auth.token ? (
                <>
                  {auth.role === 'admin' && <Nav.Link as={Link} to="/admin">Admin</Nav.Link>}
                  {auth.role === 'startup' && <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>}
                  {auth.role === 'investor' && <Nav.Link as={Link} to="/investor">Investor</Nav.Link>}
                  <Button variant="danger" onClick={() => {
                    localStorage.removeItem('auth');
                    window.location.reload();
                  }}>Logout</Button>
                </>
              ) : (
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/analyze" element={
            <ProtectedRoute requiredRole="startup">
              <Upload onUpload={handleUpload} loading={loading} />
              {analysisData && <Analysis data={analysisData} />}
            </ProtectedRoute>
          }/>

          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="startup">
              <StartupDashboard />
            </ProtectedRoute>
          }/>

          <Route path="/investor" element={
            <ProtectedRoute requiredRole="investor">
              <InvestorDashboard />
            </ProtectedRoute>
          }/>

          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }/>
        </Routes>
      </Container>
      <Footer />
    </Router>
  );
};

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
