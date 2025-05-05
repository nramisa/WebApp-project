import React, { useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  Link 
} from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import Upload from './components/Upload';
import Analysis from './components/Analysis';
import Login from './components/Auth/Login';
import Home from './components/Home';
import Footer from './components/Footer';
import AdminPanel from './components/Admin/AdminPanel';
import InvestorDashboard from './components/Dashboard/InvestorDashboard';
import StartupDashboard from './components/Dashboard/StartupDashboard';

const AuthContext = React.createContext();

const App = () => {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : { token: null, role: null };
  });

  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!auth.token) return <Navigate to="/login" replace />;
    if (requiredRole && auth.role !== requiredRole) return <Navigate to="/" replace />;
    return children;
  };

  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${auth.token}`,
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      alert(error.message || 'Upload failed');
      setAnalysisData(null);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setAuth({ token: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
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
                    <Button variant="danger" onClick={handleLogout}>Logout</Button>
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
            <Route path="/login" element={<Login setAuth={setAuth} />} />
            
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
    </AuthContext.Provider>
  );
};

export default App;
