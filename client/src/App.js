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

import PublicNavbar      from './components/PublicNavbar';
import PrivateNavbar     from './components/PrivateNavbar';
import Home              from './components/Home';
import Signup            from './components/Signup';
import Login             from './components/Login';
import Dashboard         from './components/Dashboard';
import Upload            from './components/Upload';
import Analysis          from './components/Analysis';
import MarketValidation  from './components/MarketValidation';
import InvestorQA        from './components/InvestorQA';
import Footer            from './components/Footer';

// 1) Create axios instance with baseURL & JWT interceptor
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // e.g. "https://webapp-project-rxn5.onrender.com"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [analysis,        setAnalysis]        = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync auth flag on mount
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(Boolean(auth));
  }, []);

  // 2) Upload handler now accepts single or multiple files
  const handleUpload = async (fileOrFiles) => {
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    if (!files.length) {
      alert('Please select one or more files first.');
      return;
    }

    setLoading(true);
    const formData = new FormData();

    files.forEach(file => {
      console.log('🔹 Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      formData.append('files', file);
    });

    for (let [key, val] of formData.entries()) {
      console.log('🔸 formData entry:', key, val);
    }

    try {
      const res = await api.post('/api/analysis/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('✅ Upload success, server responded with:', res.data);
      // server returns { results: [...] }
      setAnalysis(res.data.results);
    } catch (err) {
      console.error('❌ Upload error object:', err);
      const status  = err.response?.status;
      const message = err.response?.data?.error || err.message;
      alert(`Upload failed (HTTP ${status}): ${message}`);
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
        <Route path="/"       element={<Home />} />
        <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login"  element={<Login setIsAuthenticated={setIsAuthenticated} />} />

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
