import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const AdminActivateForm = () => {
  const { id } = useParams();  
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('ID récupéré depuis l\'URL:', id);  
  }, [id]);

  const handleUpdateAdminInfo = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/auth/user/${id}`, {
        fullName,
        password,
      });

      setMessage(response.data.message);
      setError('');
      navigate('/login'); 
    } catch (err) {
      setError(err.response.data.message || 'Erreur lors de la mise à jour des informations');
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Complétez vos informations</h2>

      <div>
        <input
          type="text"
          placeholder="Nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick={handleUpdateAdminInfo}>Compléter l'inscription</button>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AdminActivateForm;
