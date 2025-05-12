import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/admin/Promotions.css'
const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    produit_id: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
  });
  const [filterType, setFilterType] = useState('all'); // 'all', 'active', 'inactive'
  const [filterValue, setFilterValue] = useState('');

  const token = localStorage.getItem('token'); // Récupérez votre token d'authentification

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/promotions/getall', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromotions(response.data.promotions);
    } catch (error) {
      console.error('Erreur lors de la récupération des promotions:', error);
      // Gérez l'erreur d'affichage ici (par ex., un message à l'utilisateur)
    }
  };

  const handleDeletePromotion = async (promotionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette promotion ?')) {
      try {
        const response = await axios.delete('http://localhost:5000/api/promotions/cancel', {
          headers: { Authorization: `Bearer ${token}` },
          data: { id: promotionId },
        });
        if (response.data.success) {
          fetchPromotions(); // Recharger la liste après suppression
        } else {
          alert(response.data.error || 'Erreur lors de l\'annulation de la promotion.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'annulation de la promotion:', error);
        alert('Erreur serveur lors de l\'annulation.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPromotion({ ...newPromotion, [name]: value });
  };

  const handleAddPromotion = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/promotions/add', newPromotion, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setShowAddForm(false); // Cacher le formulaire après ajout
        setNewPromotion({ // Réinitialiser le formulaire
          produit_id: '',
          name: '',
          description: '',
          discount_type: 'percentage',
          discount_value: '',
          start_date: '',
          end_date: '',
        });
        fetchPromotions(); // Recharger la liste après ajout
      } else {
        alert(response.data.error || 'Erreur lors de l\'ajout de la promotion.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la promotion:', error);
      alert('Erreur serveur lors de l\'ajout.');
    }
  };

  const filteredPromotions = () => {
    let filtered = promotions;
    if (filterType === 'active') {
      filtered = filtered.filter(promo => promo.is_active);
    } else if (filterType === 'inactive') {
      filtered = filtered.filter(promo => !promo.is_active);
    }

    if (filterValue) {
      const lowerFilter = filterValue.toLowerCase();
      filtered = filtered.filter(promo =>
        promo.name.toLowerCase().includes(lowerFilter) ||
        promo.description.toLowerCase().includes(lowerFilter) ||
        String(promo.discount_value).includes(lowerFilter) ||
        promo.discount_type.toLowerCase().includes(lowerFilter) ||
        String(promo.produit_id).includes(lowerFilter)
      );
    }
    return filtered;
  };

  return (
    <div>
      <h2>Gestion des Promotions</h2>

      {/* Bouton Ajouter une Promotion */}
      <button onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? 'Cacher le Formulaire' : 'Ajouter une Promotion'}
      </button>

      {/* Formulaire d'ajout (affiché conditionnellement) */}
      {showAddForm && (
        <form onSubmit={handleAddPromotion}>
          <div>
            <label htmlFor="produit_id">ID du Produit:</label>
            <input
              type="number"
              id="produit_id"
              name="produit_id"
              value={newPromotion.produit_id}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="name">Nom de la Promotion:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newPromotion.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={newPromotion.description}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="discount_type">Type de Réduction:</label>
            <select
              id="discount_type"
              name="discount_type"
              value={newPromotion.discount_type}
              onChange={handleInputChange}
            >
              <option value="percentage">Pourcentage</option>
            </select>
          </div>
          <div>
            <label htmlFor="discount_value">Valeur de la Réduction:</label>
            <input
              type="number"
              id="discount_value"
              name="discount_value"
              value={newPromotion.discount_value}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="start_date">Date de Début:</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={newPromotion.start_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="end_date">Date de Fin:</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={newPromotion.end_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit">Ajouter la Promotion</button>
        </form>
      )}

      <hr />

      {/* Filtrage */}
      <div>
        <label>Filtrer par:</label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Toutes</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
        </select>
        <input
          type="text"
          placeholder="Rechercher par nom, description, etc."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
      </div>

      {/* Liste des promotions */}
      <h3>Liste des Promotions</h3>
      {filteredPromotions().length === 0 ? (
        <p>Aucune promotion trouvée.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Type</th>
              <th>Valeur</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions().map(promotion => (
              <tr key={promotion.id}>
                <td>{promotion.id}</td>
                <td>{promotion.name}</td>
                <td>{promotion.description}</td>
                <td>{promotion.discount_type}</td>
                <td>{promotion.discount_value}</td>
                <td>{new Date(promotion.start_date).toLocaleDateString()}</td>
                <td>{new Date(promotion.end_date).toLocaleDateString()}</td>
                <td>{promotion.is_active ? 'Active' : 'Inactive'}</td>
                <td>
  {promotion.is_active && (
    <button onClick={() => handleDeletePromotion(promotion.id)}>Supprimer</button>
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Promotions;