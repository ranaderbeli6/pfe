import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../Styles/user/TopRatedProductsSlider.css';
import StarRating from './StarRating';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TopRatedProductsSlider = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantites, setQuantites] = useState({});
  const carouselRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products/top-rated')
      .then(response => {
        setProduits(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur lors de la récupération des produits');
        setLoading(false);
      });
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleQuantityChange = (e, id) => {
    setQuantites(prev => ({ ...prev, [id]: parseInt(e.target.value) || 1 }));
  };

  const handleAddToCart = async (produit) => {
    try {
      const response = await axios.post('http://localhost:5000/api/cart/add', {
        productId: produit.id,
        quantity: quantites[produit.id] || 1
      }, {
        headers: { 
          Authorization: localStorage.getItem('token') 
            ? `Bearer ${localStorage.getItem('token')}` 
            : undefined 
        }
      });
      alert(response.data.message);
    } catch (error) {
      alert("Erreur lors de l'ajout au panier");
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="top-rated-carousel-container">
      
      <div className="carousel-wrapper">
        <button className="nav-button left" onClick={scrollLeft}>
          <FaChevronLeft />
        </button>
        
        <div className="carousel" ref={carouselRef}>
          {produits.map(produit => (
            <div key={produit.id} className="carousel-item">
              <div className={`badge ${produit.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {produit.stock > 0 ? 'Disponible' : 'Rupture'}
              </div>
              
              <div className="image-container">
                {produit.image ? (
                  <img src={`http://localhost:5000${produit.image}`} alt={produit.name} />
                ) : <div className="no-image">Pas d'image</div>}
              </div>
              
              <div className="product-info">
                <h3>{produit.name}</h3>
                <p className="price">{produit.price} TND</p>
                
                {produit.stock > 0 && (
                  <input
                    type="number"
                    min="1"
                    max={produit.stock}
                    value={quantites[produit.id] || 1}
                    onChange={(e) => handleQuantityChange(e, produit.id)}
                  />
                )}
                
                <div className="actions">
                  <Link to={`/produits/${produit.id}`} className="details-btn">Détails</Link>
                  {produit.stock > 0 && (
                    <button 
                      onClick={() => handleAddToCart(produit)} 
                      className="cart-btn"
                    >
                      Ajouter
                    </button>
                  )}
                </div>
                
                <div className="rating">
                  <StarRating rating={produit.averageRating || 0} />
                  <span>({produit.reviewCount || 0} avis)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="nav-button right" onClick={scrollRight}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default TopRatedProductsSlider;