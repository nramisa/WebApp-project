import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import styles from '../styles/Analysis.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
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
    
    // Mock login - in a real app, this would call your backend
    try {
      // Check if user exists in localStorage (from signup)
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.email === formData.email && user.password === formData.password) {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/');
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Failed to log in');
    }
    setLoading(false);
  };

  return (
    <div className={styles.uploadCard}>
      <Card className="shadow-lg border-0">
        <Card.Body className="p-5">
          <h2 className="text-center mb-4">Log In</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-4">
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
              className="w-100 py-3" 
              variant="danger" 
              type="submit"
            >
              Log In
            </Button>
          </Form>
          <div className="text-center mt-3">
            Need an account? <Link to="/signup">Sign Up</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
