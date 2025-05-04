import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from './App';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace with actual API call
      const mockResponse = {
        token: 'fake-jwt-token',
        role: email.includes('admin') ? 'admin' : 
              email.includes('investor') ? 'investor' : 'startup'
      };

      localStorage.setItem('auth', JSON.stringify(mockResponse));
      setAuth(mockResponse);
      navigate(mockResponse.role === 'investor' ? '/investor' : '/dashboard');
    } catch (err) {
      setError('Authentication failed');
    }
  };

  return (
    <div className="auth-page">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
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

        <Button variant="primary" type="submit" className="w-100">
          {isLogin ? 'Login' : 'Register'}
        </Button>

        <Button 
          variant="link" 
          onClick={() => setIsLogin(!isLogin)}
          className="mt-2"
        >
          {isLogin ? 'Create account' : 'Existing user? Login'}
        </Button>
      </Form>
    </div>
  );
};

localStorage.setItem('auth', JSON.stringify({
    token: 'your-jwt-token',
    role: 'startup',
    userData: {  // Add this
      name: 'John Doe', 
      email: 'john@example.com'
    }
  }));

export default Login;
