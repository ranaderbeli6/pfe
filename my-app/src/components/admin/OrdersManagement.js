import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/orders/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setOrders(res.data.orders || []);
        } catch (err) {
            console.error('Erreur:', err);
            alert("Erreur lors du chargement des commandes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const createInvoiceForOrder = async (orderId) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/factures/${orderId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            console.log(`Facture créée pour la commande ${orderId}:`, response.data);
            alert(`Facture créée pour la commande ${orderId} !`);
        } catch (error) {
            console.error(`Erreur lors de la création de la facture pour la commande ${orderId}:`, error);
            alert(`Erreur lors de la création de la facture pour la commande ${orderId}.`);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        if (window.confirm(`Changer le statut en "${newStatus}" ?`)) {
            try {
                await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
                    status: newStatus
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setOrders(orders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
                alert("Statut mis à jour !");

                // Créer la facture uniquement si le nouveau statut est "livré"
                if (newStatus === 'livré') {
                    await createInvoiceForOrder(orderId);
                }

            } catch (err) {
                alert("Échec de la mise à jour du statut");
            }
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch =
            order.id.toString().includes(searchQuery) ||
            (order.buyer?.name && order.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.buyerName && order.buyerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.contactEmail && order.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.contactPhone && order.contactPhone.includes(searchQuery));

        return matchesStatus && matchesSearch;
    });

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR');
    };

    const openOrderDetails = (order) => setSelectedOrder(order);
    const closeOrderDetails = () => setSelectedOrder(null);

    if (loading) return <div>Chargement en cours...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Gestion des commandes</h2>

            {/* Filtres et recherche */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '5px' }}
                >
                    <option value="all">Tous les statuts</option>
                    <option value="en attente">En attente</option>
                    <option value="expédié">Expédié</option>
                    <option value="livré">Livré</option>
                    <option value="annulé">Annulé</option>
                </select>

                <input
                    type="text"
                    placeholder="Rechercher par ID, nom, email ou téléphone..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ padding: '5px', flex: 1 }}
                />
            </div>

            <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentOrders.length > 0 ? currentOrders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>
                                {order.buyer?.name || order.buyerName || "Invité"}
                                <br />
                                {order.contactEmail || order.buyer?.email}
                            </td>
                            <td>{order.totalAmount} DNT</td>
                            <td>{order.status}</td>
                            <td>
                                <button
                                    onClick={() => openOrderDetails(order)}
                                    style={{ marginRight: '5px' }}
                                >
                                    Détails
                                </button>
                                <select
                                    value={order.status}
                                    onChange={e => handleStatusChange(order.id, e.target.value)}
                                    disabled={order.status === 'annulé'}
                                >
                                    <option value="en attente">En attente</option>
                                    <option value="expédié">Expédié</option>
                                    <option value="livré">Livré</option>
                                    <option value="annulé">Annulé</option>
                                </select>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>Aucune commande trouvée</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Précédent
                </button>
                <span>Page {currentPage} / {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Suivant
                </button>
            </div>

            {selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxWidth: '800px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    padding: '20px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    zIndex: 1000
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Détails de la commande #{selectedOrder.id}</h2>
                        <button onClick={closeOrderDetails} style={{ padding: '5px 10px' }}>X</button>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h3>Informations client</h3>
                        <p><strong>Nom:</strong> {selectedOrder.buyer?.name || selectedOrder.buyerName}</p>
                        <p><strong>Email:</strong> {selectedOrder.contactEmail || selectedOrder.buyer?.email}</p>
                        <p><strong>Téléphone:</strong> {selectedOrder.contactPhone || selectedOrder.buyer?.phone}</p>
                        <p><strong>Adresse de livraison:</strong> {selectedOrder.shippingAddress}</p>
                        <p><strong>Méthode de paiement:</strong> {selectedOrder.paymentMethod}</p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h3>Informations commande</h3>
                        <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                        <p><strong>Statut:</strong> {selectedOrder.status}</p>
                        <p><strong>Montant total:</strong> {selectedOrder.totalAmount} DNT</p>
                    </div>

                    <div>
                        <h3>Articles commandés</h3>
                        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginBottom: '20px' }}>
                            <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th>Fournisseur</th>
                                    <th>Quantité</th>
                                    <th>Prix unitaire</th>
                                    <th>Total</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <strong>{item.product.name}</strong>
                                            <p>{item.product.description}</p>
                                        </td>
                                        <td>
                                            {item.supplier ? (
                                                <>
                                                    <p><strong>{item.supplier.name}</strong></p>
                                                    <p>{item.supplier.email}</p>
                                                    <p>{item.supplier.phone}</p>
                                                </>
                                            ) : 'Aucun fournisseur'}
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>{item.product.price} DNT</td>
                                        <td>{item.quantity * item.product.price} DNT</td>
                                        <td>{item.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersManagement;