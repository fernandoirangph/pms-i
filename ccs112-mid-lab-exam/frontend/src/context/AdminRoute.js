import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, authToken } = useAuth();
  const isAdmin = authToken && user?.role === 'admin';

  console.log('AdminRoute Check: ', { authToken: !!authToken, user, isAdmin });

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default AdminRoute;