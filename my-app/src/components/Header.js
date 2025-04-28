import React, { useState, useEffect } from 'react'; 
import { FaHome, FaSignInAlt, FaShoppingCart, FaEnvelope, FaUserCircle, FaSignOutAlt, FaUserCog } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/Header.css";
import logo from '../images/logo.png';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    }
    
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setIsLoggedIn(true);
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Authentication check error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserRole(null);
      navigate('/');
      setDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  return (
    <header className="header">
       <Link to="/"> <div className="header-left">
        <img src={logo} alt="Verdanova Logo" className="logo" />
      </div>
      </Link>
      
      <nav className="nav-links">
        <Link to="/">Accueil</Link>
        
        <div 
          className={`catalogue-dropdown ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <Link to="/" className="catalogue-btn">Catalogue</Link>
          <div className="dropdown-menu">
            <Link to="/catalogue/produits">Produits Agricoles</Link>
            <Link to="/catalogue/services">Services Agricoles</Link>
          </div>
        </div>

        {isLoggedIn && (
          <>
            {userRole === 'acheteur' && <Link to="/acheteur">Votre Espace</Link>}
            {userRole === 'fournisseur' && <Link to="/fournisseur">Espace fournisseur</Link>}
            {(userRole === 'admin' || userRole === 'superadmin') && <Link to="/admin">Espace admin</Link>}
          </>
        )}
        <Link to="/about">A propos</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      
      <div className="header-icons">
        <Link to="/">
          <FaHome />
        </Link>
        
        {isLoggedIn ? (
          <div className="profile-dropdown">
            <FaUserCircle 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              style={{ cursor: 'pointer' }}
            />
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link 
                  to={userRole === 'acheteur' ? '/mon-compte' : '/mon-compte'} 
                  onClick={() => setDropdownOpen(false)}
                >
                  <FaUserCog /> Mon compte
                </Link>
                <button onClick={handleLogout}>
                  <FaSignOutAlt /> Se deconnecter
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <FaSignInAlt />
          </Link>
        )}
        
        <Link to="/panier">
          <FaShoppingCart />
        </Link>
        <Link to="/contact">
          <FaEnvelope />
        </Link>
      </div>
    </header>
  );
};

export default Header;