import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/Orders.css';
import defaultImage from '../../images/aa.jpg';
import Header from '../Header';
import Factures from './Factures ';
const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('recent');
    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/connexion');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/orders/userorders', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setOrders(response.data.orders);
                setFilteredOrders(response.data.orders);
            } catch (err) {
                console.error("Erreur récupération commandes:", err);
                setError(err.response?.data?.message || 'Erreur lors du chargement des commandes');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const getStatusColor = (status) => {
        const statusMap = {
            'en attente': 'orange',
            'en préparation': 'blue',
            'expédié': 'purple',
            'livré': 'green',
            'annulé': 'red'
        };
        return statusMap[status] || 'gray';
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
            return;
        }

        try {
            setCancellingOrder(orderId);
            const token = localStorage.getItem('token');
            
            await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: 'annulé' } : order
            ));
            
            alert("Commande annulée avec succès. Les produits ont été restockés.");
        } catch (err) {
            console.error("Erreur annulation commande:", err);
            alert(err.response?.data?.message || "Impossible d'annuler la commande. Veuillez réessayer.");
        } finally {
            setCancellingOrder(null);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        if (statusFilter) {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        if (dateFilter === 'recent') {
            filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        setFilteredOrders(filtered);
    };

    useEffect(() => {
        filterOrders();
    }, [statusFilter, dateFilter, orders]);

    if (loading) return <div className="loading">Chargement de vos commandes...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div>
            <Header />
            <div className="orders-page">
                <div className="orders-container">
                    <h1>Vos Commandes</h1>
                    <div className="orders-info-bar">
                        <p>
                            Ici, vous pouvez consulter vos commandes. 
                            <br />
                            <strong>Besoin de consulter votre panier ?</strong>{' '}
                            <span 
                                className="link-to-cart" 
                                onClick={() => navigate('/panier')}
                            >
                                Cliquez
                            </span>.
                            <strong>Besoin de consulter vos factures ?</strong>{' '}
                            <span 
                                className="link-to-cart" 
                                onClick={() => navigate('/factures')}
                            >
                                Cliquez
                            </span>.
                        </p>
                    </div>

                    <div className="filters">
                        <select 
                            onChange={(e) => setStatusFilter(e.target.value)} 
                            value={statusFilter}
                            className="filter-select"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="en attente">En attente</option>
                            <option value="expédié">Expédié</option>
                            <option value="livré">Livré</option>
                            <option value="annulé">Annulé</option>
                        </select>

                        <select 
                            onChange={(e) => setDateFilter(e.target.value)} 
                            value={dateFilter}
                            className="filter-select"
                        >
                            <option value="recent">Plus récentes d'abord</option>
                            <option value="oldest">Plus anciennes d'abord</option>
                        </select>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="no-orders">
                            <p>Pas encore de commandes</p>
                            <button 
                                className="btn-shop" 
                                onClick={() => navigate('/catalogue')}
                            >
                                Découvrir nos produits
                            </button>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {filteredOrders.map(order => (
                                <div key={order.id} className="order-card-simple">
                                    <div className="order-header-simple">
                                        <div>
                                            <h3>Commande #{order.id}</h3>
                                            <p className="order-date">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="order-summary-simple">
                                            <p className="order-status" style={{ color: getStatusColor(order.status) }}>
                                                {order.status.toUpperCase()}
                                            </p>
                                            <p className="order-total">{order.totalAmount.toFixed(2)} TND</p>
                                        </div>
                                    </div>
                                    <div className="order-actions-simple">
                                        <button 
                                            className="btn-details"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            Voir détails
                                        </button>
                                        {order.status === 'en attente' && (
                                            <button
                                                className="btn-cancel"
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={cancellingOrder === order.id}
                                            >
                                                {cancellingOrder === order.id 
                                                    ? 'Annulation...' 
                                                    : 'Annuler'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedOrder && (
                <>
                    <div className="order-detail-modal-backdrop"></div>
                    <div className="order-detail-modal">
                        <div className="modal-content">
                            <button 
                                className="close-modal"
                                onClick={() => setSelectedOrder(null)}
                            >
                                &times;
                            </button>
                            
                            <div className="order-header">
                                <h2>Détails de la commande #{selectedOrder.id}</h2>
                                <p className="order-date">{formatDate(selectedOrder.createdAt)}</p>
                                <p 
                                    className="order-status" 
                                    style={{ color: getStatusColor(selectedOrder.status) }}
                                >
                                    {selectedOrder.status.toUpperCase()}
                                </p>
                            </div>

                            <div className="order-details-section">
                                <div className="shipping-info">
                                    <h3>Informations de livraison</h3>
                                    <p><strong>Nom:</strong> {selectedOrder.buyerName}</p>
                                    <p><strong>Email:</strong> {selectedOrder.contactEmail}</p>
                                    <p><strong>Téléphone:</strong> {selectedOrder.contactPhone}</p>
                                    <p><strong>Adresse:</strong> {selectedOrder.shippingAddress}</p>
                                </div>

                                <div className="payment-info">
                                    <h3>Informations de paiement</h3>
                                    <p><strong>Méthode:</strong> {selectedOrder.paymentMethod}</p>
                                    <p><strong>Total:</strong> {selectedOrder.totalAmount.toFixed(2)} TND</p>
                                </div>
                            </div>

                            <div className="order-items-section">
                                <h3>Articles ({selectedOrder.orderItems.length})</h3>
                                <div className="items-list">
                                    {selectedOrder.orderItems.map(item => (
                                        <div key={item.id} className="order-item-detail">
                                            <div className="item-image">
                                                <img
                                                    src={item.product.image
                                                        ? `http://localhost:5000${item.product.image}`
                                                        : defaultImage
                                                    }
                                                    alt={item.product.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = defaultImage;
                                                    }}
                                                />
                                            </div>
                                            <div className="item-info">
                                                <h4>{item.product.name}</h4>
                                                <div className="item-meta">
                                                    <span>Quantité: {item.quantity}</span>
                                                    <span>Prix unitaire: {item.priceAtPurchase.toFixed(2)} TND</span>
                                                    <span>Total: {(item.priceAtPurchase * item.quantity).toFixed(2)} TND</span>
                                                </div>
                                                <p className="item-status">
                                                    Statut: <span style={{ color: getStatusColor(item.status) }}>
                                                        {item.status}
                                                    </span>
                                                </p>
                                                {item.fournisseurName && (
                                                    <p>Vendeur: {item.fournisseurName}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                {selectedOrder.status === 'en attente' && (
                                    <button
                                        className="btn-cancel"
                                        onClick={() => {
                                            handleCancelOrder(selectedOrder.id);
                                            setSelectedOrder(null);
                                        }}
                                        disabled={cancellingOrder === selectedOrder.id}
                                    >
                                        {cancellingOrder === selectedOrder.id 
                                            ? 'Annulation en cours...' 
                                            : 'Annuler la commande'}
                                    </button>
                                )}
                                <button 
                                    className="btn-close"
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Orders;