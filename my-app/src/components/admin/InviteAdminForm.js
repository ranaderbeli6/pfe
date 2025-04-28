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
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de l'invitation");
      setMessage('');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2 style={styles.title}>Inviter un admin</h2>
        <input
          type="email"
          placeholder="Email de l'admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleInviteAdmin} style={styles.button}>
          Envoyer l'invitation
        </button>

        {message && <p style={{ ...styles.feedback, color: 'green' }}>{message}</p>}
        {error && <p style={{ ...styles.feedback, color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formBox: {
    marginTop :'10 px',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    marginBottom: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#2c2c2c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  feedback: {
    marginTop: '1rem',
    fontSize: '0.95rem',
    textAlign: 'center',
  },
};

export default InviteAdminForm;
