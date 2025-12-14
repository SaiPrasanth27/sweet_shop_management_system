import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CartIcon from '../Cart/CartIcon';
import CartSidebar from '../Cart/CartSideBar';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>SweetCorp</h1>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <Link to="/orders" className="nav-link">My Orders</Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="nav-link">Admin Dashboard</Link>
                )}
                
                {!isAdmin && (
                  <CartIcon onClick={() => setShowCart(true)} />
                )}
                
                <div className="user-menu">
                  <span className="user-info">
                    Welcome, {user?.username}
                    {isAdmin && <span className="admin-badge">Admin</span>}
                  </span>
                  <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </nav>
        </div>
      </div>
      
      {isAuthenticated && !isAdmin && (
        <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
      )}
    </header>
  );
};

export default Header;