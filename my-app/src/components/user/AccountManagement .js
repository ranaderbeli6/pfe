import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/user/AccountManagement .css';
import Header from '../Header';
const AccountManagement = () => {
  const [user, setUser] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    description: '',
    role: ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/user/info', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement');
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = () => {
    if (passwords.newPassword && passwords.newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (passwords.newPassword && !passwords.currentPassword) {
      setError('Le mot de passe actuel est requis');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validatePassword()) return;

    try {
      const updateData = { 
        ...user,
        ...(passwords.newPassword && { 
          currentPassword: passwords.currentPassword,
          password: passwords.newPassword 
        })
      };

      const res = await axios.put('http://localhost:5000/api/auth/info', updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setMessage('Informations mises à jour avec succès');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      fetchUserData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de mise à jour');
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="account-container">
      <Header />
      <h2>Gestion du compte</h2>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Informations de base */}
        <div className="form-group">
          <label>Nom complet</label>
          <input
            type="text"
            name="fullName"
            value={user.fullName}
            onChange={handleUserChange}
          />
        </div>

        <div className="form-group">
          <label>Numéro de téléphone</label>
          <input
            type="text"
            name="phoneNumber"
            value={user.phoneNumber}
            onChange={handleUserChange}
          />
        </div>

        {user.role === 'acheteur' && (
          <div className="form-group">
            <label>Adresse</label>
            <input
              type="text"
              name="address"
              value={user.address}
              onChange={handleUserChange}
            />
          </div>
        )}

        {user.role === 'fournisseur' && (
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={user.description}
              onChange={handleUserChange}
            />
          </div>
        )}

        <p><strong>Rôle :</strong> {user.role}</p>

        <h3>Changer le mot de passe</h3>

        <div className="form-group">
          <label>Mot de passe actuel</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
          />
        </div>

        <div className="form-group">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
          />
        </div>

        <div className="form-group">
          <label>Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
          />
        </div>

        <button type="submit" className="save-button">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
};

export default AccountManagement;
