import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import '../styles/auth.css';

const API_BASE = process.env.REACT_APP_API_URL;

const Signup = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Signup failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Get Started</h2>
          <p>Create your PitchIn account</p>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} className="auth-form">
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control type="text" required value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" required value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" required value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </Form.Group>
          <Button disabled={loading} type="submit" variant="primary">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          <div className="auth-footer mt-3">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Signup;
