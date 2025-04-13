import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '../Header';
import '../../Styles/user/Panier.css';

const Panier = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stockErrors, setStockErrors] = useState({});

    const isConnected = !!localStorage.getItem('token');

    const fetchCart = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/cart/', {
                withCredentials: true,
                headers: {
                    Authorization: localStorage.getItem('token') 
                        ? `Bearer ${localStorage.getItem('token')}` 
                        : undefined
                }
            });
            setCart(response.data.data);
            setStockErrors({});
        } catch (err) {
            console.error("Erreur panier", err);
            setError('Erreur lors du chargement du panier');
        } finally {
            setLoading(false);
        }
    }, [isConnected]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const updateQuantity = async (cartItemId, newQuantity) => {
        try {
          const item = cart.items.find(item => item.id === cartItemId);
          if (!item) return;
      
          newQuantity = parseInt(newQuantity);
          if (isNaN(newQuantity)) return;
      
          if (newQuantity < 1) {
            setStockErrors(prev => ({...prev, [cartItemId]: 'La quantité minimale est 1'}));
            return;
          }
      
          const response = await axios.put(
            `http://localhost:5000/api/cart/items/${cartItemId}`,
            { quantity: newQuantity },
            {
              withCredentials: true, // Essentiel pour les sessions
              headers: {
                Authorization: isConnected ? `Bearer ${localStorage.getItem('token')}` : undefined
              }
            }
          );
      
          const updatedItems = cart.items.map(item => 
            item.id === cartItemId ? { ...item, quantity: newQuantity } : item
          );
          setCart({...cart, items: updatedItems});
      
          setStockErrors(prev => ({...prev, [cartItemId]: undefined}));
        } catch (err) {
          console.error("Erreur mise à jour quantité", err);
          setStockErrors(prev => ({
            ...prev,
            [cartItemId]: err.response?.data?.message || 'Erreur de mise à jour'
          }));
        }
      };

      const removeItem = async (cartItemId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
        try {
            await axios.delete(`http://localhost:5000/api/cart/items/${cartItemId}`, {
                withCredentials: true,
                headers: {
                    Authorization: isConnected ? `Bearer ${localStorage.getItem('token')}` : undefined
                },
            });
            fetchCart();
        } catch (err) {
            console.error("Erreur lors de la suppression", err);
        }
    };
    
    const clearCart = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) return;
    
        try {
            await axios.delete('http://localhost:5000/api/cart/clear', {
                withCredentials: true,
                headers: {
                    Authorization: isConnected ? `Bearer ${localStorage.getItem('token')}` : undefined
                },
            });
            fetchCart();
        } catch (err) {
            console.error("Erreur lors du vidage", err);
        }
    };
    if (loading) return <div className="loading">Chargement du panier...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="panier-page">
            <Header />

            <div className="panier-container">
                <h1>Votre Panier</h1>

                {!cart || cart.items.length === 0 ? (
                    <div className="panier-vide">
                        <p>Votre panier est vide</p>
                        <Link to="/catalogue/produits" className="btn-boutique">
                            Retour à la boutique
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="items-list">
                            {cart.items.map(item => {
                                const currentStock = item.Produit?.stock || item.stock || 0;
                                const currentQuantity = item.quantity;
                                const unitPrice = item.priceAtAddition || item.price;
                                const maxPossible = currentStock + currentQuantity;
                                
                                return (
                                    <div key={item.id} className="cart-item">
                                        <div className="item-image">
                                            {item.Produit?.image ? (
                                                <img
                                                    src={`http://localhost:5000${item.Produit.image}`}
                                                    alt={item.Produit.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/placeholder-product.png';
                                                    }}
                                                />
                                            ) : item.image ? (
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/placeholder-product.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="no-image">
                                                    <img src="/placeholder-product.png" alt="Pas d'image" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="item-details">
                                            <h3>{item.Produit?.name || item.name}</h3>
                                            <p>Prix unitaire: {unitPrice.toFixed(2)} TND</p>
                                            <p>Stock disponible: {currentStock}</p>

                                            <div className="quantity-control">
                                                <button
                                                    onClick={() => updateQuantity(item.id, currentQuantity - 1)}
                                                    disabled={currentQuantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span>{currentQuantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, currentQuantity + 1)}
                                                    disabled={currentQuantity >= maxPossible}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {stockErrors[item.id] && (
                                                <p className="stock-error">{stockErrors[item.id]}</p>
                                            )}

                                            <p className="item-total">
                                                Total: {(unitPrice * currentQuantity).toFixed(2)} TND
                                            </p>
                                        </div>

                                        <button 
                                            className="remove-item" 
                                            onClick={() => removeItem(item.id)}
                                            aria-label="Supprimer l'article"
                                        >
                                            ×
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cart-summary">
                            <h3>Récapitulatif</h3>
                            <p>
                                Nombre d'articles:{' '}
                                {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                            </p>
                            <p>
                                Total:{' '}
                                {cart.items
                                    .reduce(
                                        (acc, item) =>
                                            acc + (item.quantity * (item.priceAtAddition || item.price)),
                                        0
                                    )
                                    .toFixed(2)}{' '}
                                TND
                            </p>

                            <div className="cart-actions">
                                <button className="btn-clear" onClick={clearCart}>
                                    Vider le panier
                                </button>

                                {isConnected ? (
                                    <Link to="/checkout" className="btn-checkout">
                                        Passer la commande
                                    </Link>
                                ) : (
                                    <Link to="/connexion" className="btn-checkout">
                                        Connectez-vous pour commander
                                    </Link>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Panier;