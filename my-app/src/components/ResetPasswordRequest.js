import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

function ResetPasswordRequest() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResetPasswordRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 5000); 
    } catch (err) {
      setError(err.response.data.message || 'Erreur interne');
    }
  };

  return (
    <div>
      <h2>Réinitialiser le mot de passe</h2>
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
      <form onSubmit={handleResetPasswordRequest}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Envoyer un email de réinitialisation</button>
      </form>
    </div>
  );
}

export default ResetPasswordRequest;
