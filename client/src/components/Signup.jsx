import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import '../styles/auth.css';

const Signup = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
    
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      localStorage.setItem('user', JSON.stringify(formData));
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch {
      setError('Failed to create account');
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
            <Form.Control 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </Form.Group>

          
          <Button 
            disabled={loading} 
            variant="primary"
            type="submit"
          >
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
