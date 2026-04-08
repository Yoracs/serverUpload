import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎨</span>
          <span className="logo-text">Pixel<span className="text-gradient">Battle</span></span>
        </Link>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Game
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              {isAdmin && (
                <Link to="/admin" className="navbar-link admin-link" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
              <div className="user-info">
                <span className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user?.username}</span>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn-primary navbar-btn" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="toggle-icon"></span>
          <span className="toggle-icon"></span>
          <span className="toggle-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
