import React, { useState } from 'react';
import { Link, useNavigate }   from 'react-router-dom';
import { Alert }               from 'react-bootstrap';
import '../styles/auth.css';

const API_BASE = process.env.REACT_APP_API_URL;

const Signup = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'founder'
  });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Get Started</h2>
        <p>Create your PitchIn account</p>
        {error && <Alert variant="danger">{error}</Alert>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="mb-3">
            <label>Full Name</label>
            <input type="text" required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label>Email Address</label>
            <input type="email" required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input type="password" required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label>I am a</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="form-control"
            >
              <option value="founder">Startup Founder</option>
              <option value="investor">Investor</option>
            </select>
          </div>
          <button disabled={loading} type="submit" className="btn btn-primary w-100">
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer mt-3">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
