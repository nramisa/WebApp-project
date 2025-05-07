import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import styles from '../styles/Analysis.module.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    startupName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Mock signup - in a real app, this would call your backend
    try {
      localStorage.setItem('user', JSON.stringify(formData));
      navigate('/');
    } catch {
      setError('Failed to create an account');
    }
    setLoading(false);
  };

  return (
    <div className={styles.uploadCard}>
      <Card className="shadow-lg border-0">
        <Card.Body className="p-5">
          <h2 className="text-center mb-4">Startup Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
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
              <Form.Label>Email</Form.Label>
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
            <Form.Group className="mb-4">
              <Form.Label>Startup Name</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.startupName}
                onChange={(e) => setFormData({...formData, startupName: e.target.value})}
              />
            </Form.Group>
            <Button 
              disabled={loading} 
              className="w-100 py-3" 
              variant="danger" 
              type="submit"
            >
              Sign Up
            </Button>
          </Form>
          <div className="text-center mt-3">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Signup;
