import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LoadingModal from '../LoadingModal';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingModal show={loading} message="Checking authentication..." />;
  }

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;