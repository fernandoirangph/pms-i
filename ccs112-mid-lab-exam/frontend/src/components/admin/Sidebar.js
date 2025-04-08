import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Sidebar() {
  const { logout, authToken } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const API_BASE_URL = 'http://localhost:8000';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok || response.status === 401) {
        console.log('Logout successful or token invalid.');

        logout();
        navigate('/login');
      } else {

        const errorData = await response.json();
        console.error('Logout failed on server:', errorData);
        setLogoutError(errorData.message || 'Logout failed. Please try again.');
      }
    } catch (err) {
      console.error('Network error during logout:', err);
      setLogoutError('Network error. Could not logout.');

    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-light" style={{
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto'
    }}>
      <a href="/admin" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
        <span className="fs-4">Admin Panel</span>
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <NavLink
            to="/admin/products"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : 'link-dark'}`}
          >
            Products
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/transactions"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : 'link-dark'}`}
          >
            Transactions
          </NavLink>
        </li>
      </ul>
      <hr />
      {logoutError && <div className="alert alert-danger alert-sm p-2">{logoutError}</div>}
      <button
        className="btn btn-danger w-100"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}

export default Sidebar;