import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content-area">
        <div className="main-content-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
