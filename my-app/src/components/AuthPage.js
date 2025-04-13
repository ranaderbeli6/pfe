import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Styles/Login.css';
import axios from '../axios'
function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, role } = response.data; 
  
      localStorage.setItem('token', token);
      localStorage.setItem('role', role); 
      if (role === 'fournisseur') {
        navigate('/fournisseur');  
    } else if (role === 'acheteur') {
        navigate('/profileacheteur');  
    } else if (role === 'admin' || role === 'superadmin') {
        navigate('/admin');  
    } else {
        navigate('/profile');  
    }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur interne');
    }
  };
  

  const handleRegister = async (e) => {
    e.preventDefault();
  
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
      await axios.post('http://localhost:5000/api/auth/register', {
        fullName,
        email,
        password,
        phoneNumber,
        role,
        address,
        description,
      });
  
      setFullName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      setRole('');
      setAddress('');
      setDescription('');
      setError('');
  
      // pass auto au form connexion
      setIsLogin(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur interne');
    }
  };
  

  return (
    <div>
      <br />
      <br />
      <div className="login-wrap">
        <div className="login-html">
          <input
            id="tab-1"
            type="radio"
            name="tab"
            className="sign-in"
            checked={isLogin}
            onChange={() => setIsLogin(true)}
          />
          <label htmlFor="tab-1" className="tab">
            Se connecter
          </label>
          <input
            id="tab-2"
            type="radio"
            name="tab"
            className="sign-up"
            checked={!isLogin}
            onChange={() => setIsLogin(false)}
          />
          <label htmlFor="tab-2" className="tab">
            S'inscrire
          </label>
          <div className="login-form">
            {isLogin ? (
              <div className="sign-in-htm">
                <form onSubmit={handleLogin}>
                  <div className="group">
                    <label htmlFor="email" className="label">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="group">
                    <label htmlFor="password" className="label">
                      Mot de passe
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="group">
                    <button type="submit" className="button">
                      Se connecter
                    </button>
                  </div>
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
                <div className="hr"></div>
                <div className="foot-lnk">
                  <Link to="/reset-password-request">Mot de passe oublié ?</Link>
                </div>
              </div>
            ) : (
              <div className="sign-up-htm">
                <form onSubmit={handleRegister}>
                  <div className="group">
                    <label htmlFor="fullName" className="label">
                      Nom complet
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      className="input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="group">
                    <label htmlFor="email" className="label">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="group">
                    <label htmlFor="password" className="label">
                      Mot de passe
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="group">
                    <label htmlFor="phoneNumber" className="label">
                      Numéro de téléphone
                    </label>
                    <input
                      id="phoneNumber"
                      type="text"
                      className="input"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="group">
                    <label htmlFor="role" className="label">
                      Rôle
                    </label>
                    <select
                      id="role"
                      className="input"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez un rôle</option>
                      <option value="acheteur">Acheteur</option>
                      <option value="fournisseur">Fournisseur</option>
                    </select>
                  </div>
                  {role === 'acheteur' && (
                    <div className="group">
                      <label htmlFor="address" className="label">
                        Adresse
                      </label>
                      <input
                        id="address"
                        type="text"
                        className="input"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  {role === 'fournisseur' && (
                    <div className="group">
                      <label htmlFor="description" className="label">
                        Description
                      </label>
                      <input
                        id="description"
                        type="text"
                        className="input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="group">
                    <button type="submit" className="button">
                      S'inscrire
                    </button>
                  </div>
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
                <div className="hr"></div>
                <div className="foot-lnk">
                  <label onClick={() => setIsLogin(true)}>Déjà membre ?</label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
