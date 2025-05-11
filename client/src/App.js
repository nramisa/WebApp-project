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
import AdminDashboard    from './components/AdminDashboard';
import Footer            from './components/Footer';
import InvestorPanel from './components/InvestorPanel';

// Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
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

  // File upload handler...
  const handleUpload = async (fileOrFiles) => {
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    if (!files.length) {
      alert('Please select files first.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    try {
      const res = await api.post('/api/analysis/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(res.data.results);
    } catch (err) {
      alert(`Upload failed: ${err.response?.data?.error || err.message}`);
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
        <Route path="/dashboard" element={
          isAuthenticated
            ? <Dashboard />
            : <Navigate to="/login" replace />
        }/>

        <Route path="/analyze" element={
          isAuthenticated
            ? <><Upload onUpload={handleUpload} loading={loading} />{analysis && <Analysis data={analysis} />}</>
            : <Navigate to="/login" replace />
        }/>

        <Route path="/market" element={
          isAuthenticated
            ? <MarketValidation />
            : <Navigate to="/login" replace />
        }/>

        <Route path="/qa" element={
          isAuthenticated
            ? <InvestorQA />
            : <Navigate to="/login" replace />
        }/>

        {/* Admin Panel (safe optional check) */}
        <Route path="/admin" element={
          isAuthenticated && JSON.parse(localStorage.getItem('user'))?.isAdmin
            ? <AdminDashboard />
            : <Navigate to="/" replace />
        }/>

        {/* Fallback */}
        <Route path="*" element={
          <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />
        }/>

          <Route path="/investor" element={
  isAuthenticated && JSON.parse(localStorage.getItem('user'))?.isInvestor
    ? <InvestorPanel />
    : <Navigate to="/" replace />
} /> 
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
