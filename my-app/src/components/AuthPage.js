import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Styles/Login.css';
import Header from './Header';
import axios from '../axios';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: '',
    address: '',
    description: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { email, password } = formData;
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      switch (role) {
        case 'fournisseur':
          navigate('/fournisseur');
          break;
        case 'acheteur':
          navigate('/profileacheteur');
          break;
        case 'admin':
        case 'superadmin':
          navigate('/admin');
          break;
        default:
          navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur interne lors de la connexion.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const { email, password, phoneNumber } = formData;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("L'email est invalide.");
      return;
    }

    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Le numéro de téléphone doit contenir exactement 8 chiffres.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: '',
        address: '',
        description: ''
      });
      setIsLogin(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l’inscription.');
    }
  };

  return (
    <div className="auth-container">
      <Header />
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Se connecter
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            S'inscrire
          </button>
        </div>

        <div className="auth-form">
          {isLogin ? (
            <form onSubmit={handleLogin} className="form-content">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input id="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <button type="submit" className="auth-button">Se connecter</button>
              {error && <p className="error-message">{error}</p>}
              <div className="auth-footer">
                <Link to="/reset-password-request">Mot de passe oublié ?</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="form-content">
              <div className="form-group">
                <label htmlFor="fullName">Nom complet</label>
                <input id="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input id="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Téléphone</label>
                <input id="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="role">Rôle</label>
                <select id="role" value={formData.role} onChange={handleChange} required>
                  <option value="">Choisir un rôle</option>
                  <option value="acheteur">Acheteur</option>
                  <option value="fournisseur">Fournisseur</option>
                </select>
              </div>
              {formData.role === 'acheteur' && (
                <div className="form-group">
                  <label htmlFor="address">Adresse</label>
                  <input id="address" type="text" value={formData.address} onChange={handleChange} required />
                </div>
              )}
              {formData.role === 'fournisseur' && (
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <input id="description" type="text" value={formData.description} onChange={handleChange} required />
                </div>
              )}
              <button type="submit" className="auth-button">S'inscrire</button>
              {error && <p className="error-message">{error}</p>}
              <div className="auth-footer">
                <span onClick={() => setIsLogin(true)}>Déjà un compte ? Connecte-toi</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
