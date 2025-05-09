import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import axios from 'axios';

import './styles/base.css';
import './styles/auth.css';

import PublicNavbar from './components/PublicNavbar';
import PrivateNavbar from './components/PrivateNavbar';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import Analysis from './components/Analysis';
import MarketValidation from './components/MarketValidation';
import InvestorQA from './components/InvestorQA';
import Footer from './components/Footer';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // on mount: sync auth flag from localStorage
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(Boolean(auth));
  }, []);

  // send file to backend → get analysis
  const handleUpload = async (file) => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post('https://webapp-project-rxn5.onrender.com/api/analyze', formData);

      setAnalysis(data);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      {isAuthenticated
        ? <PrivateNavbar setIsAuthenticated={setIsAuthenticated} />
        : <PublicNavbar />
      }

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route
          path="/signup"
          element={<Signup setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated
              ? <Dashboard />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/analyze"
          element={
            isAuthenticated
              ? (
                <>
                  <Upload onUpload={handleUpload} loading={loading} />
                  {analysis && <Analysis data={analysis} />}
                </>
              )
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/market"
          element={
            isAuthenticated
              ? <MarketValidation />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/qa"
          element={
            isAuthenticated
              ? <InvestorQA />
              : <Navigate to="/login" replace />
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? '/dashboard' : '/'}
              replace
            />
          }
        />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
