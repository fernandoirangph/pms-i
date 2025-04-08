import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function AdminLayout() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <div className="flex-shrink-0 bg-light" style={{ width: '280px' }}>
        <Sidebar />
      </div>

      <div className="flex-grow-1 p-4" style={{
        backgroundColor: '#f8f9fa',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;