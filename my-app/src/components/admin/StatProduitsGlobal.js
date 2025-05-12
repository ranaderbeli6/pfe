import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StatProduitsGlobal = () => {
    const [produits, setProduits] = useState([]);
    const [sortBy, setSortBy] = useState('ventes');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        axios.get('http://localhost:5000/api/statsadmin/produits-global')
            .then(res => {
                setProduits(res.data.produits);
            })
            .catch(err => {
                console.error("Erreur lors de la récupération des stats produits :", err);
            });
    }, []);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const sortedProduits = [...produits].sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'ventes') {
            comparison = a.ventes - b.ventes;
        } else if (sortBy === 'chiffreAffaire') {
            comparison = a.chiffreAffaire - b.chiffreAffaire;
        }
        return sortOrder === 'asc' ? comparison : comparison * -1;
    });

    const getSortIndicator = (column) => {
        if (sortBy === column) {
            return sortOrder === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    return (
        <div>
            <h2>Statistiques Globales des Produits</h2>
            <table>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th onClick={() => handleSort('ventes')} style={{ cursor: 'pointer' }}>
                            Ventes{getSortIndicator('ventes')}
                        </th>
                        <th onClick={() => handleSort('chiffreAffaire')} style={{ cursor: 'pointer' }}>
                            Chiffre d'Affaires{getSortIndicator('chiffreAffaire')}
                        </th>
                        <th>Nombre d'Avis</th>
                        <th>Note Moyenne</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedProduits.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.ventes}</td>
                            <td>{p.chiffreAffaire.toFixed(2)} TND</td>
                            <td>{p.totalAvis}</td>
                            <td>{p.moyenneNote}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StatProduitsGlobal;