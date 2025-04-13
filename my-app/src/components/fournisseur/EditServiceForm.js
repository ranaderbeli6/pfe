import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Headerfournisseur';
import '../../Styles/fournisseur/EditServiceForm.css';

function EditServiceForm() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    disponibilite: '',
    duration: '',
    image: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/services/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFormData(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération du service');
      }
    };
    fetchService();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/services/${id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      navigate('/fournisseur/services');
    } catch (err) {
      setError('Erreur lors de la modification du service');
    }
  };

  return (
    <div>
      <div className="edit-service-form">
        <h2>Modifier le Service</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom du service"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Prix"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <select
            value={formData.disponibilite}
            onChange={(e) => setFormData({ ...formData, disponibilite: e.target.value })}
            required
          >
            <option value="">Sélectionner la disponibilité</option>
            <option value="Disponible">Disponible</option>
            <option value="Indisponible">Indisponible</option>
          </select>
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    </div>
  );
}

export default EditServiceForm;
