import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function RegisterPage() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [errors, setErrors] = useState({});

  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const { login, authToken, user } = useAuth();

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    if (authToken && user) {
      console.log(`RegsiterPage: User already logged in as ${user.role}. Redirecting...`);
      if (user.role === 'admin') {
        navigate('/admin/products', { replace: true });
      } else if (user.role === 'customer') {
        navigate('/store/catalog', { replace: true });
      }
    }
  }, [authToken, user, navigate]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});
    setGeneralError('');

    if (password !== passwordConfirmation) {
      setErrors({ password: 'Password confirmation does not match.' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
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
        console.log('Registration successful:', data);
        login(data.token, data.user);
        navigate('/store/catalog');

      } else {

        console.error('Registration failed:', data);

        if (response.status === 422 && data.errors) {

          setErrors(
            Object.keys(data.errors).reduce((acc, key) => {
              acc[key] = data.errors[key][0];
              return acc;
            }, {})
          );
          setGeneralError('Please check the errors below.');
        } else {
          setGeneralError(data.message || `An error occurred: ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error('Network or fetch error:', err);
      setGeneralError('Could not connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authToken && user) {
    return <div className="container text-center mt-5"><p>Redirecting...</p></div>;
  }

  return (
    <div className="container mt-5 mb-5"><div className="row justify-content-center">
      <div className="col-md-8 col-lg-6"><div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">Create Account</h3>
          <form onSubmit={handleSubmit}>
            {generalError && !Object.keys(errors).length && (
              <div className="alert alert-danger" role="alert">
                {generalError}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="nameInput" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                id="nameInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="emailInput" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="emailInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="passwordInput" className="form-label">
                Password
              </label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="passwordInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="passwordConfirmInput" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"

                className={`form-control ${errors.password?.includes('confirmation') ? 'is-invalid' : ''}`}
                id="passwordConfirmInput"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                disabled={isLoading}
              />
              {errors.password?.includes('confirmation') && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="visually-hidden">Loading...</span>
                    {' '}Registering...
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
      </div>
    </div>
    </div>
  );
}

export default RegisterPage;