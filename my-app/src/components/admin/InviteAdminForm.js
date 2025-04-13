import React, { useState } from 'react';
import axios from 'axios';
import HeaderAdmin from './HeaderAdmin';
const InviteAdminForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInviteAdmin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/invite-admin', {
        email,
      });
      setMessage(response.data.message);
      setError('');
      setEmail(''); // Réinitialiser le champ email après envoi
    } catch (err) {
      setError(err.response.data.message || 'Erreur lors de l\'envoi de l\'invitation');
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Inviter un admin</h2>
      <div>
        <input
          type="email"
          placeholder="Email de l'admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button onClick={handleInviteAdmin}>Envoyer l'invitation</button>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default InviteAdminForm;
