import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

   useEffect(() => {
    const rememberToken = localStorage.getItem('remember_token');
    if (rememberToken) {
      const { email, password } = JSON.parse(rememberToken);
      setEmail(email || '');
      setPassword(password || '');
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Save or remove credentials based on rememberMe
    if (rememberMe) {
      localStorage.setItem('remember_token', JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem('remember_token');
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
 
        login(data.access_token); 
        
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setError({
            type: 'validation',
            messages: errorMessages,
          });
        } else {
          setError({
            type: 'login',
            message: data.message || 'Login failed. Please check your credentials.',
          });
        }
      }
    } catch (err) {
      setError({
        type: 'network',
        message: 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="p-4 p-md-5 rounded shadow w-100 border-0" style={{ maxWidth: 420, background: 'rgba(255,255,255,0.97)' }}>
        <div className="text-center mb-4">
          <img src="../logo192.png" alt="Klick Inc. Logo" width={70} className="mb-2" />
          <h2 className="fw-bold" style={{ color: '#0d6efd', letterSpacing: '1px' }}>Klick Inc. Portal</h2>
          <p className="text-muted small">Sign in to your Klick Inc. account</p>
        </div>
        {error && (
          <Alert variant={error.type === 'network' ? 'danger' : error.type === 'validation' ? 'warning' : 'danger'}>
            {error.type === 'validation' ? (
              <ul className="mb-0 ps-3">
                {error.messages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            ) : (
              error.message
            )}
          </Alert>
        )}
        <Form onSubmit={handleLogin} autoComplete="on">
          <Form.Group className="mb-3 text-start" controlId="formBasicEmail">
            <Form.Label className="fw-semibold">Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your Klick Inc. email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              size="lg"
            />
          </Form.Group>
          <Form.Group className="mb-3 text-start" controlId="formBasicPassword">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="lg"
            />
          </Form.Group>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Check
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label={<span className="small">Remember Me</span>}
            />
            <Link to="/register" className="text-primary small ms-2 fw-semibold">
              Register
            </Link>
          </div>
          <Button variant="primary" type="submit" className="w-100 mb-2 py-2 fs-5" style={{ background: 'linear-gradient(90deg, #0d6efd 60%, #00c6ff 100%)', border: 'none' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default Login;