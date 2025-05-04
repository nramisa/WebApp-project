import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      // Add API call to your backend
      const response = await fetch('/api/auth/' + (isLogin ? 'login' : 'register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        navigate(isLogin ? '/dashboard' : '/profile-setup');
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh', background: 'var(--light-bg)' }}>
      <Container className="py-5">
        <div className="auth-card shadow-lg p-4 bg-white rounded-3" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Register'}</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button 
              variant="danger" 
              type="submit" 
              className="w-100 py-2 mb-3"
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-decoration-none"
              >
                {isLogin ? 'Create new account' : 'Already have an account?'}
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default Login;
