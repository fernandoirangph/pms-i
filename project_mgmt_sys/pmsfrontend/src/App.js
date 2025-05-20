import React from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard/Dashboard'; 
import ProjectTable from './components/Dashboard/ProjectsTable'; 
import TaskTable from './components/Dashboard/TasksTable';     
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

export const API_BASE_URL = 'http://localhost:8000/api'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="projects" replace />} />
              <Route path="projects" element={<ProjectTable />} />
              <Route path="tasks" element={<TaskTable />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}


function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div className="container mt-5 text-center">Loading Authentication...</div>;
  }

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default App;