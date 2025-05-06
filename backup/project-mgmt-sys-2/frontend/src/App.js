// App.jsx - Main application file
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import API service
import api from './api';

// Components
import Login from './components/Auth/Login';
// import Register from './components/Auth/Register';
// import Dashboard from './components/Dashboard/Dashboard';
// import Projects from './components/Projects/Projects';
// import ProjectDetail from './components/Projects/ProjectDetail';
// import Tasks from './components/Tasks/Tasks';
// import TaskDetail from './components/Tasks/TaskDetail';
// import Resources from './components/Resources/Resources';
// import Reports from './components/Reports/Reports';
import Navigation from './components/Layout/Navigation';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorHandling/ErrorBoundary';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Use our configured API instance
        const response = await api.get('/api/auth/user');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        // Clear tokens if authentication fails
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token, refreshToken) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className="app">
          {isAuthenticated && <Navigation user={user} onLogout={logout} />}
          <div className="container-fluid">
            <Routes>
              <Route path="/login" element={!isAuthenticated ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} />
              {/* <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} /> */}

              {/* Protected routes */}
              <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                {/* <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/projects" element={<Projects user={user} />} />
                <Route path="/projects/:id" element={<ProjectDetail user={user} />} />
                <Route path="/tasks" element={<Tasks user={user} />} />
                <Route path="/tasks/:id" element={<TaskDetail user={user} />} />
                <Route path="/resources" element={<Resources user={user} />} />
                <Route path="/reports" element={<Reports user={user} />} /> */}
              </Route>

              <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
          </div>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;