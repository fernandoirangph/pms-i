import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerRoute = () => {
  const { user, authToken } = useAuth();

  const isCustomer = authToken && user?.role === 'customer';

  if (!isCustomer) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};
export default CustomerRoute;