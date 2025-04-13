import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../Styles/user/Catalogue.css';
import Header from '../Header';
import bannerImage from '../../images/mm.jpg';

const Catalogue = () => {
    const [produits, setProduits] = useState([]);
    const [quantites, setQuantites] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Vérifie si l'utilisateur est connecté au chargement du composant
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }

        // Récupère les produits
        axios.get('http://localhost:5000/api/products/produits')
            .then(response => {
                setProduits(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError('Erreur lors de la récupération des produits');
                setLoading(false);
            });
    }, []);

    // Gestion de l'ajout au panier
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

    // Mise à jour de la quantité du produit
    const handleQuantityChange = (e, produitId) => {
        const newQuantite = parseInt(e.target.value, 10);
        setQuantites(prevQuantites => ({
            ...prevQuantites,
            [produitId]: newQuantite
        }));
    };

    return (
        <div className="catalogue-page">
            <Header />

            <div className="welcome-banner">
                <div className="banner-image">
                    <img src={bannerImage} alt="Bannière d'accueil" />
                </div>
                <div className="banner-content">
                    <h1>Bienvenue dans </h1>
                    <h1>notre </h1>
                    <h1>boutique</h1>
                    <p>Découvrez nos produits agricoles de qualité supérieure, frais et respectueux de l'environnement.</p>
                    <Link to="#catalogue" className="explore-btn">Explorer notre catalogue</Link>
                </div>
            </div>

            {loading && <p>Chargement des produits...</p>}
            {error && <p>{error}</p>}

            <div className="catalogue" id="catalogue">
                <h2>Nos Produits</h2>
                <div className="produits-list">
                    {produits.map(produit => (
                        <div key={produit.id} className="produit-card">
                            <div className="product-badge">
                                {produit.stock > 0 ? 'Disponible' : 'Rupture'}
                            </div>
                            <div className="image-container">
                                {produit.image ? (
                                    <img src={`http://localhost:5000${produit.image}`} alt={produit.name} />
                                ) : (
                                    <div className="no-image">Aucune image disponible</div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3>{produit.name}</h3>
                                <p className="product-description">
                                    {produit.description.length > 100
                                        ? `${produit.description.substring(0, 100)}...`
                                        : produit.description}
                                </p>
                                <p className="product-price">{produit.price} TND</p>

                                {/* Affichage de la quantité disponible */}
                                <p className="product-stock">
                                    Stock : {produit.stock} 
                                </p>

                                {produit.stock > 0 && (
                                    <div className="quantity-selector">
                                        <input
                                            type="number"
                                            min="1"
                                            max={produit.stock}
                                            value={quantites[produit.id] || 1}
                                            onChange={(e) => handleQuantityChange(e, produit.id)}
                                        />
                                    </div>
                                )}

                                <div className="product-actions">
                                    <Link to={`/produits/${produit.id}`} className="details-btn">Voir détails</Link>
                                    {produit.stock > 0 && (
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(produit)}
                                        >
                                            Ajouter au panier
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Catalogue;
