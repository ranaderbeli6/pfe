import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../Header';
import '../../Styles/user/Panier.css';

const Panier = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stockErrors, setStockErrors] = useState({});
    const [checkoutModal, setCheckoutModal] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('carte bancaire');
    const [buyerName, setBuyerName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const navigate = useNavigate();

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
                    withCredentials: true,
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

    const handleCheckout = () => {
        setCheckoutModal(true);
    };

    const submitOrder = async () => {
        try {
            if (isConnected) {
                // Commande pour utilisateur connecté
                const response = await axios.post('http://localhost:5000/api/orders/', {
                    paymentMethod,
                    shippingAddress: shippingAddress || undefined
                }, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setOrderDetails(response.data);
                setOrderSuccess(true);
                fetchCart();
            } else {
                // Commande pour invité
                if (!buyerName || !contactPhone || !shippingAddress || !paymentMethod) {
                    alert('Veuillez remplir tous les champs obligatoires (*)');
                    return;
                }

                const response = await axios.post('http://localhost:5000/api/orders/guest', {
                    buyerName,
                    contactPhone,
                    contactEmail,
                    shippingAddress,
                    paymentMethod,
                    cartId: cart.id
                }, {
                    withCredentials: true
                });

                setOrderDetails(response.data);
                setOrderSuccess(true);
                fetchCart();
            }
        } catch (err) {
            console.error("Erreur lors de la commande", err);
            alert(err.response?.data?.message || 'Erreur lors de la commande');
        }
    };

    const closeModal = () => {
        setCheckoutModal(false);
        if (orderSuccess) {
            setOrderSuccess(false);
            navigate(isConnected ? '/acheteur' : '/');
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
                                const unitPrice = item.priceAtAddition || item.Produit?.price || item.price;
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
                                            acc + (item.quantity * (item.priceAtAddition || item.Produit?.price || item.price)),
                                        0
                                    )
                                    .toFixed(2)}{' '}
                                TND
                            </p>

                            <div className="cart-actions">
                                <button className="btn-clear" onClick={clearCart}>
                                    Vider le panier
                                </button>

                                <button className="btn-checkout" onClick={handleCheckout}>
                                    Passer la commande
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal de checkout */}
            {checkoutModal && (
                <div className="checkout-modal-overlay">
                    <div className="checkout-modal">
                        <div className="modal-content">
                            <button className="close-modal" onClick={closeModal}>
                                &times;
                            </button>

                            {orderSuccess ? (
                                <div className="order-success">
                                    <h2>Commande confirmée! Merci pour votre confiance</h2>
                                    <p>Votre commande a été passée avec succès <strong> + 8dt livraison</strong></p>
                                    <p>Nous allons vous contacter pour la confirmation. </p>
                                    

                                    <button 
                                        className="btn-confirm" 
                                        onClick={() => navigate("/acheteur")}
                                    >
                                        Vous pouvez suivre votre commande , Si connecté
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2>Finaliser la commande</h2>
                                    
                                    {!isConnected && (
                                        <>
                                            <div className="form-group">
                                                <label>Nom complet *</label>
                                                <input
                                                    type="text"
                                                    value={buyerName}
                                                    onChange={(e) => setBuyerName(e.target.value)}
                                                    placeholder="Votre nom complet"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    value={contactEmail}
                                                    onChange={(e) => setContactEmail(e.target.value)}
                                                    placeholder="Votre email"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Téléphone *</label>
                                                <input
                                                    type="tel"
                                                    value={contactPhone}
                                                    onChange={(e) => setContactPhone(e.target.value)}
                                                    placeholder="Votre numéro de téléphone"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="form-group">
                                        <label>Méthode de paiement *</label>
                                        <select 
                                            value={paymentMethod} 
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            required
                                        >
                                            <option value="carte bancaire">Carte bancaire</option>
                                            <option value="livraison">Paiement à la livraison</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Adresse de livraison *</label>
                                        <textarea
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            placeholder="Entrez votre adresse de livraison complète"
                                            rows="3"
                                            requiredn
                                        />
                                        
                                    </div>

                                    <div className="modal-actions">
                                        <button 
                                            className="btn-cancel" 
                                            onClick={closeModal}
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            className="btn-confirm" 
                                            onClick={submitOrder}
                                            disabled={!paymentMethod || (!isConnected && (!buyerName || !contactPhone || !shippingAddress))}
                                        >
                                            Confirmer la commande
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Panier;