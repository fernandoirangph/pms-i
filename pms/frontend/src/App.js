// App.jsx - Main application file
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Navigation from './components/Layout/Navigation';
import ErrorBoundary from './components/ErrorHandling/ErrorBoundary';
import Projects from './components/Projects/Projects';
import ViewProject from './components/Projects/ViewProject';

// Auth Context
import { AuthProvider } from './components/Auth/AuthContext';
import TaskList from './components/TaskList';
export const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<><Navigation /><Dashboard /></>} />
              <Route path="/projects" element={<><Navigation /><Projects /></>} />
              <Route path="/projects" element={<><Navigation /><TaskList /></>} />
              <Route path="/projects/:projectId/" element={<><Navigation /><ViewProject /></>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;