import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../Styles/admin/AdminProductsManagement.css';

const AdminProductsManagement = () => {
  const [produits, setProduits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('en_attente');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          showMessage('Veuillez vous connecter pour continuer.', 'error');
          setIsLoading(false);
          return;
        }

        let url = 'http://localhost:5000/api/products/produits';
        if (activeFilter === 'en_attente') {
          url = 'http://localhost:5000/api/products/produits/en-attente';
        }
        
        const response = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Filtrer les produits selon le statut
        const data = activeFilter === 'approuvé' 
          ? response.data.filter(p => p.status === 'approuvé')
          : response.data;

        setProduits(data);
      } catch (error) {
        showMessage('Erreur lors de la récupération des produits', 'error');
        console.error(error);
        setProduits([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduits();
  }, [activeFilter]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const accepterProduit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/products/produits/accepter/${id}`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setProduits(prev => prev.filter(p => p.id !== id));
      showMessage('Produit approuvé avec succès', 'success');
    } catch (error) {
      showMessage('Erreur lors de l\'approbation du produit', 'error');
      console.error(error);
    }
  };

  const refuserProduit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/products/produits/refuser/${id}`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setProduits(prev => prev.filter(p => p.id !== id));
      showMessage('Produit refusé avec succès', 'success');
    } catch (error) {
      showMessage('Erreur lors du refus du produit', 'error');
      console.error(error);
    }
  };

  const supprimerProduit = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/products/produits/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setProduits(prev => prev.filter(p => p.id !== id));
      showMessage('Produit supprimé avec succès', 'success');
    } catch (error) {
      showMessage('Erreur lors de la suppression du produit', 'error');
      console.error(error);
    }
  };

  return (
    <div className="admin-products-container">
      <h1 className="admin-title">Gestion des Produits</h1>
      <p className="admin-description">
        Vous pouvez gérer ici tous les produits. 
        {activeFilter === 'en_attente' && ' Approuvez ou refusez les nouveaux produits soumis.'}
        {activeFilter === 'approuvé' && ' Modifiez ou supprimez les produits approuvés.'}
      </p>

      <div className="filter-buttons">
        <button 
          className={`filter-btn ${activeFilter === 'en_attente' ? 'active' : ''}`}
          onClick={() => handleFilterChange('en_attente')}
        >
          Produits en Attente
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'approuvé' ? 'active' : ''}`}
          onClick={() => handleFilterChange('approuvé')}
        >
          Produits Approuvés
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="products-table-container">
        {isLoading ? (
          <div className="loading-spinner">Chargement en cours...</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Prix (TND)</th>
                <th>Stock</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.length > 0 ? (
                produits.map((produit) => (
                  <tr key={produit.id} className={`product-row status-${produit.status}`}>
                    <td>{produit.name}</td>
                    <td>{produit.description}</td>
                    <td>{produit.price}</td>
                    <td>{produit.stock}</td>
                    <td>{produit.category}</td>
                    <td>
                      <span className={`status-badge ${produit.status}`}>
                        {produit.status === 'en_attente' ? 'En attente' : 
                         produit.status === 'approuvé' ? 'Approuvé' : 'Refusé'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {produit.status === 'en_attente' ? (
                        <>
                          <button 
                            onClick={() => accepterProduit(produit.id)}
                            className="action-btn approve-btn"
                          >
                            Accepter
                          </button>
                          <button 
                            onClick={() => refuserProduit(produit.id)}
                            className="action-btn reject-btn"
                          >
                            Refuser
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => console.log('Modifier', produit.id)}
                            className="action-btn edit-btn"
                          >
                            Modifier
                          </button>
                          <button 
                            onClick={() => supprimerProduit(produit.id)}
                            className="action-btn delete-btn"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-products">
                    {activeFilter === 'en_attente' 
                      ? 'Aucun produit en attente de validation' 
                      : 'Aucun produit approuvé trouvé'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminProductsManagement;