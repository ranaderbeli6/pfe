import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../Styles/user/Catalogue.css';
import Header from '../Header';
import bannerImage from '../../images/mm.jpg';
import StarRating from './StarRating';

const Catalogue = () => {
  const [produits, setProduits] = useState([]);
  const [quantites, setQuantites] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviews, setReviews] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [categories] = useState([
    'Semences', 'Engrais et Fertilisants', 'Matériels Agricoles',
    'Produits Phytosanitaires', 'Alimentation Animale', 'Élevage',
    'Serres et Irrigation', 'Bois et Plantes', 'Autres'
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    axios.get('http://localhost:5000/api/products/produits')
      .then(response => {
        setProduits(response.data);
        const ids = response.data.map(p => p.id);
        fetchReviews(ids);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors de la récupération des produits');
        setLoading(false);
      });
  }, []);

  const fetchReviews = async (productIds) => {
    const reviewsData = {};
    for (const id of productIds) {
      try {
        const res = await axios.get(`http://localhost:5000/api/avis/${id}`);
        reviewsData[id] = res.data;
      } catch {
        reviewsData[id] = [];
      }
    }
    setReviews(reviewsData);
  };

  const calculateAverageRating = (id) => {
    if (!reviews[id] || reviews[id].length === 0) return 0;
    const sum = reviews[id].reduce((acc, r) => acc + Number(r.note), 0);
    return sum / reviews[id].length;
  };

  const handleQuantityChange = (e, id) => {
    const value = parseInt(e.target.value, 10) || 1;
    setQuantites(prev => ({ ...prev, [id]: value }));
  };

  const handleAddToCart = async (produit) => {
    const quantite = parseInt(quantites[produit.id]) || 1;

    try {
        const response = await axios.post('http://localhost:5000/api/cart/add', {
            productId: produit.id,
            quantity: quantite
        }, {
            withCredentials: true, // Important pour les cookies de session
            headers: { 
                Authorization: localStorage.getItem('token') 
                    ? `Bearer ${localStorage.getItem('token')}` 
                    : undefined 
            }
        });

        alert(response.data.message);
    } catch (error) {
        console.error(error);
        alert("Erreur lors de l'ajout au panier");
    }
};
  const filteredProduits = produits.filter(produit =>
    produit.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory ? produit.category === selectedCategory : true)
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProduits = filteredProduits.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProduits.length / itemsPerPage);

  return (
    <div className="catalogue-page">
      <Header />
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Bienvenue sur notre plateforme agricole 🌿</h1>
          <p>Produits de qualité, services au top : tout est réuni ici.</p>
          <p><strong>🛒Commandez facilement, connecté ou pas !</strong></p>
          {!isLoggedIn && (
            <div className="action-buttons">
              <Link to="/register" className="welcome-btn">Créer un compte</Link>
              <a href="#catalogue" className="welcome-btn">Commander sans compte</a>
            </div>
          )}
        </div>
      </div>
      {loading && <p>Chargement...</p>}
      {error && <p className="error">{error}</p>}

      <div className="catalogue" id="catalogue">
        <div className="filters">
          <input
            type="text"
            placeholder="🔍 Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Toutes les catégories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="produits-list">
          {currentProduits.map(produit => (
            <div key={produit.id} className="produit-card">
              <div className={`product-badge ${produit.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {produit.stock > 0 ? 'Disponible' : 'Rupture'}
              </div>
              <div className="image-container">
                {produit.image ? (
                  <img src={`http://localhost:5000${produit.image}`} alt={produit.name} />
                ) : <div className="no-image">Pas d’image</div>}
              </div>
              <div className="product-info">
                <h3>{produit.name}</h3>
                <p>{produit.description?.slice(0, 100)}...</p>
                <p className="price">{produit.price} TND</p>
                <p>Stock : {produit.stock}</p>

                {produit.stock > 0 && (
                  <input
                    type="number"
                    min="1"
                    max={produit.stock}
                    value={quantites[produit.id] || 1}
                    onChange={(e) => handleQuantityChange(e, produit.id)}
                  />
                )}

                <div className="product-actions">
                  <Link to={`/produits/${produit.id}`} className="details-btn">Détails</Link>
                  {produit.stock > 0 && (
                    <button onClick={() => handleAddToCart(produit)} className="add-to-cart-btn">
                      Ajouter au panier
                    </button>
                  )}
                </div>

                <div className="product-rating">
                  <StarRating rating={calculateAverageRating(produit.id)} />
                  <span>({reviews[produit.id]?.length || 0} avis)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={currentPage === i + 1 ? 'active' : ''}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Catalogue;
