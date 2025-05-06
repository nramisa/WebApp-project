import React, { useState, useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('startup');
  const [error, setError] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(email, password, role);
    if (success) navigate(role === 'investor' ? '/investor-dashboard' : '/dashboard');
    else setError('Registration failed');
  };

  return (
    <div className="auth-page">
      <h2>Create Account</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Account Type</Form.Label>
          <div className="d-flex gap-3 mb-4">
            <Button
              variant={role === 'startup' ? 'danger' : 'outline-secondary'}
              onClick={() => setRole('startup')}
              className="flex-grow-1"
            >
              Startup
            </Button>
            <Button
              variant={role === 'investor' ? 'danger' : 'outline-secondary'}
              onClick={() => setRole('investor')}
              className="flex-grow-1"
            >
              Investor
            </Button>
          </div>
        </Form.Group>

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
            minLength="6"
          />
        </Form.Group>

        <Button variant="danger" type="submit" className="w-100 mb-3">
          Create Account
        </Button>
        <div className="text-center">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </Form>
    </div>
  );
};

export default Signup;
