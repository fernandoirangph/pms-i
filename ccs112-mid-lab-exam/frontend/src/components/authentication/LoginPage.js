import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, authToken, user  } = useAuth();

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    if (authToken && user) {
      console.log(`LoginPage: User already logged in as ${user.role}. Redirecting...`);
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
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);

        login(data.token, data.user);

        if (data.user.role === 'admin') {
          navigate('/admin/products');
        } else {
          navigate('/store/catalog');
        }

      } else {
        const errorData = await response.json();

        console.error('Login failed:', errorData);

        if (response.status === 422 && errorData.errors) {
          const emailError = errorData.errors.email ? errorData.errors.email[0] : null;
          const passwordError = errorData.errors.password ? errorData.errors.password[0] : null;
          setError(emailError || passwordError || errorData.message || 'Login failed.');
        } else {
          setError(errorData.message || `An error occurred: ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error('Network or fetch error:', err);
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authToken && user) {
    return <div className="container text-center mt-5"><p>Redirecting...</p></div>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4">Login</h3>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-describedby="emailHelp"
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="passwordInput" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="passwordInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
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
                        {' '}Logging In...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                Don't have an account? <a href="/register">Register here</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
