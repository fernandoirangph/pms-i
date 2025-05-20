import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== passwordConfirmation) {
      setError({
        type: 'validation',
        messages: ['Passwords do not match.'],
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
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
            message: data.message || 'Registration failed. Please check your input.',
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
    <Container fluid className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-klick-gradient">
      <div className="p-4 p-md-5 rounded shadow w-100 border-0" style={{ maxWidth: 420, background: 'rgba(255,255,255,0.97)' }}>
        <div className="text-center mb-4">
          <img src="/klick-logo.png" alt="Klick Inc. Logo" width={70} className="mb-2" />
          <h2 className="fw-bold" style={{ color: '#0d6efd', letterSpacing: '1px' }}>Klick Inc. Portal</h2>
          <p className="text-muted small">Create your Klick Inc. account</p>
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
        <Form onSubmit={handleRegister} autoComplete="on">
          <Form.Group className="mb-3 text-start" controlId="formBasicName">
            <Form.Label className="fw-semibold">Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              size="lg"
            />
          </Form.Group>
          <Form.Group className="mb-3 text-start" controlId="formBasicEmail">
            <Form.Label className="fw-semibold">Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your Klick Inc. email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
          <Form.Group className="mb-3 text-start" controlId="formBasicPasswordConfirmation">
            <Form.Label className="fw-semibold">Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              size="lg"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100 mb-2 py-2 fs-5" style={{ background: 'linear-gradient(90deg, #0d6efd 60%, #00c6ff 100%)', border: 'none' }} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <div className="text-center">
            <p className="mb-0">
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-semibold">
                Login here
              </Link>
            </p>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default RegisterPage;