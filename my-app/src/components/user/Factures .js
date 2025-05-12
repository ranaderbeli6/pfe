import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import '../../Styles/user/Factures.css';
import Header from '../Header';

const Factures = () => {
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('dateEmission'); // Default sort by
    const [sortOrder, setSortOrder] = useState('desc'); // Default sort order

    useEffect(() => {
        const fetchFactures = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/factures/factures', {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined,
                    },
                });
                setFactures(response.data.data);
            } catch (err) {
                console.error("Erreur lors de la récupération des factures:", err);
                setError("Erreur lors du chargement des factures.");
            } finally {
                setLoading(false);
            }
        };

        fetchFactures();
    }, []);

    const handleDownload = async (factureId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/factures/${factureId}/telecharger`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined,
                    },
                    responseType: 'blob',
                }
            );
            const filename = `facture_${factureId}.pdf`;
            saveAs(response.data, filename);
        } catch (error) {
            console.error("Erreur lors du téléchargement de la facture:", error);
            setError("Erreur lors du téléchargement de la facture.");
        }
    };

    const sortFactures = (data, by, order) => {
        return [...data].sort((a, b) => {
            const valueA = a[by];
            const valueB = b[by];

            if (valueA < valueB) {
                return order === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    const handleSortOrderChange = (event) => {
        setSortOrder(event.target.value);
    };

    const sortedFactures = sortFactures(factures, sortBy, sortOrder);

    if (loading) {
        return <div>Chargement des factures...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="factures-container">
            <Header />
            <h1>Vos Factures</h1>

            <div className="sort-options">
                <label htmlFor="sortBy">Trier par :</label>
                <select id="sortBy" value={sortBy} onChange={handleSortChange}>
                    <option value="numeroFacture">Numéro de Facture</option>
                    <option value="dateEmission">Date d'Émission</option>
                    <option value="montantTotal">Montant Total</option>
                </select>

                <label htmlFor="sortOrder">Ordre :</label>
                <select id="sortOrder" value={sortOrder} onChange={handleSortOrderChange}>
                    <option value="asc">Ascendant</option>
                    <option value="desc">Descendant</option>
                </select>
            </div>

            {sortedFactures.length === 0 ? (
                <p>Vous n'avez aucune facture pour le moment.</p>
            ) : (
                <table className="factures-table">
                    <thead>
                        <tr>
                            <th>Numéro de Facture</th>
                            <th>Date d'Émission</th>
                            <th>Montant Total</th>
                            <th>Télécharger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedFactures.map(facture => (
                            <tr key={facture.id}>
                                <td>{facture.numeroFacture}</td>
                                <td>{new Date(facture.dateEmission).toLocaleDateString()}</td>
                                <td>{facture.montantTotal} TND</td>
                                <td>
                                    <button onClick={() => handleDownload(facture.id)}>
                                        Télécharger
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Factures;