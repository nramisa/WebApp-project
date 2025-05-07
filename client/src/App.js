import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container, Image } from 'react-bootstrap';
import Upload from './components/Upload';
import Analysis from './components/Analysis';
import InvestorQA from './components/InvestorQA';
import MarketValidation from './components/MarketValidation';
import Home from './components/Home';
import Footer from './components/Footer';
import Signup from './components/Signup';
import Login from './components/Login';
import Profile from './components/Profile';
import axios from 'axios';
import './styles/base.css';
import './styles/auth.css'; // New auth styles

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(!!authStatus);
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('pitchFile', file);

    try {
      const response = await axios.post('http://localhost:3001/api/analyze', formData);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Analysis failed');
    }
    setLoading(false);
  };

  return (
    <Router>
      {isAuthenticated && (
        <Navbar bg="white" expand="lg" className="shadow-sm" variant="light">
          <Container>
            <Navbar.Brand as={Navigate} to="/home" className="text-danger fw-bold">
              PitchIn
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Navigate} to="/home" className="mx-2">Home</Nav.Link>
                <Nav.Link as={Navigate} to="/analyze" className="mx-2">Analyze</Nav.Link>
                <Nav.Link as={Navigate} to="/qa" className="mx-2">Q&A</Nav.Link>
                <Nav.Link as={Navigate} to="/market" className="mx-2">Market</Nav.Link>
                <Nav.Link as={Navigate} to="/profile" className="mx-2">
                  <Image 
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                    width="30" 
                    height="30" 
                    roundedCircle 
                    className="border profile-image"
                  />
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
        
        {isAuthenticated ? (
          <>
            <Route path="/home" element={<Home />} />
            <Route path="/analyze" element={
              <>
                <Upload onUpload={handleUpload} loading={loading} />
                {analysis && <Analysis data={analysis} />}
              </>
            } />
            <Route path="/qa" element={<InvestorQA />} />
            <Route path="/market" element={<MarketValidation />} />
            <Route path="/profile" element={<Profile />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>

      {isAuthenticated && <Footer />}
    </Router>
  );
}

export default App;
