import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { notificationAPI } from '../../services/api';
import { FiMenu, FiX, FiShoppingCart, FiBell, FiUser, FiLogOut, FiHome, FiCoffee, FiActivity, FiGrid, FiList } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationAPI.getMy({ unread: 'true' }).then(res => {
        setUnreadCount(res.data.data.unreadCount);
      }).catch(() => {});
    }
  }, [user, location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const getNavLinks = () => {
    if (!user) return [];
    const links = [{ to: '/', label: 'Home', icon: <FiHome /> }];
    if (user.role === 'customer') {
      links.push(
        { to: '/menu', label: 'Menu', icon: <FiCoffee /> },
        { to: '/my-orders', label: 'My Orders', icon: <FiList /> },
        { to: '/reservations', label: 'Reservations', icon: <FiGrid /> },
        { to: '/gym', label: 'Gym', icon: <FiActivity /> }
      );
    } else if (user.role === 'admin') {
      links.push(
        { to: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid /> },
        { to: '/admin/orders', label: 'Orders', icon: <FiList /> },
        { to: '/admin/menu', label: 'Menu', icon: <FiCoffee /> },
        { to: '/admin/tables', label: 'Tables', icon: <FiGrid /> },
        { to: '/admin/gym', label: 'Gym', icon: <FiActivity /> },
        { to: '/admin/inventory', label: 'Inventory', icon: <FiList /> },
        { to: '/admin/users', label: 'Users', icon: <FiUser /> }
      );
    } else if (user.role === 'kitchen_staff') {
      links.push({ to: '/kitchen', label: 'Kitchen Orders', icon: <FiList /> });
    } else if (user.role === 'gym_trainer') {
      links.push({ to: '/trainer', label: 'My Members', icon: <FiActivity /> });
    }
    return links;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏋️‍♂️☕</span>
          <span className="brand-text">FitBite</span>
        </Link>
        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {getNavLinks().map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
        <div className="navbar-actions">
          {user ? (
            <>
              {user.role === 'customer' && (
                <Link to="/cart" className="nav-icon-btn">
                  <FiShoppingCart />
                  {getItemCount() > 0 && <span className="badge-count">{getItemCount()}</span>}
                </Link>
              )}
              <Link to="/notifications" className="nav-icon-btn">
                <FiBell />
                {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
              </Link>
              <div className="nav-user">
                <Link to="/profile" className="nav-icon-btn"><FiUser /></Link>
                <button onClick={handleLogout} className="nav-icon-btn" title="Logout"><FiLogOut /></button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
