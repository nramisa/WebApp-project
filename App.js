import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Upload from './components/Upload';
import Analysis from './components/Analysis';
import InvestorQA from './components/InvestorQA';
import MarketValidation from './components/MarketValidation';
import Home from './components/Home';
import Footer from './components/Footer';
import axios from 'axios';
import './styles/base.css';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

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
      <Navbar bg="white" expand="lg" className="shadow-sm" variant="light">
        <Container>
          <Navbar.Brand as={Link} to="/" className="text-danger fw-bold">
            PitchIn
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/" className="mx-2">Home</Nav.Link>
              <Nav.Link as={Link} to="/analyze" className="mx-2">Analyze</Nav.Link>
              <Nav.Link as={Link} to="/qa" className="mx-2">Q&A</Nav.Link>
              <Nav.Link as={Link} to="/market" className="mx-2">Market</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4 py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={
            <>
              <Upload onUpload={handleUpload} loading={loading} />
              {analysis && <Analysis data={analysis} />}
            </>
          } />
          <Route path="/qa" element={<InvestorQA />} />
          <Route path="/market" element={<MarketValidation />} />
        </Routes>
      </Container>

      <Footer />
    </Router>
  );
}

export default App;