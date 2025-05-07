import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './styles/base.css';
import './styles/auth.css';

// Components
import PublicNavbar from './components/PublicNavbar';
import PrivateNavbar from './components/PrivateNavbar';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';
import InvestorQA from './components/InvestorQA';
import MarketValidation from './components/MarketValidation';
import Upload from './components/Upload';
import Footer from './components/Footer';

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
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
        } />
        <Route path="/analyze" element={
          isAuthenticated ? (
            <>
              <Upload onUpload={handleUpload} loading={loading} />
              {analysis && <Analysis data={analysis} />}
            </>
          ) : <Navigate to="/login" />
        } />
        <Route path="/market" element={isAuthenticated ? <MarketValidation /> : <Navigate to="/login" />} />
        <Route path="/qa" element={isAuthenticated ? <InvestorQA /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
