import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { FaChartLine, FaMoneyBillWave, FaStar, FaBoxOpen, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import '../../Styles/fournisseur/StatProduits.css'; 

const StatProduits = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'chiffreAffaire', direction: 'desc' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/stats/fournisseur/produits', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setStats(res.data.produits);
      } catch (err) {
        setError("Erreur lors du chargement des statistiques");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const sortedStats = React.useMemo(() => {
    if (!stats.length) return [];
    const sortableStats = [...stats];
    sortableStats.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableStats;
  }, [stats, sortConfig]);

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (error) return <div className="error">{error}</div>;

  const topProduits = [...sortedStats]
    .sort((a, b) => b.chiffreAffaire - a.chiffreAffaire)
    .slice(0, 5);

  return (
    <div className="stat-produits-container">
      <h1 className="stat-title">Statistiques des Produits</h1>
      
      <div className="stats-summary">
        <div className="summary-card">
          <FaBoxOpen className="summary-icon" />
          <h3>Produits</h3>
          <p>{stats.length}</p>
        </div>
        <div className="summary-card">
          <FaMoneyBillWave className="summary-icon" />
          <h3>Chiffre d'Affaires Total</h3>
          <p>{stats.reduce((acc, curr) => acc + curr.chiffreAffaire, 0).toFixed(2)} DNT</p>
        </div>
        <div className="summary-card">
          <FaChartLine className="summary-icon" />
          <h3>Ventes Totales</h3>
          <p>{stats.reduce((acc, curr) => acc + curr.ventes, 0)}</p>
        </div>
      </div>
      €
      <div className="chart-section">
        <h2>Top 5 Produits par Chiffre d'Affaires</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProduits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} DNT`, "Chiffre d'affaires"]} />
              <Bar dataKey="chiffreAffaire" name="Chiffre d'affaires">
                {topProduits.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 70}, 70%, 50%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="products-table-section">
        <h2>Détails par Produit</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort('name')}>
                  Produit {getSortIcon('name')}
                </th>
                <th onClick={() => requestSort('price')}>
                  Prix {getSortIcon('price')}
                </th>
                <th onClick={() => requestSort('ventes')}>
                  Ventes {getSortIcon('ventes')}
                </th>
                <th onClick={() => requestSort('chiffreAffaire')}>
                  CA {getSortIcon('chiffreAffaire')}
                </th>
                <th onClick={() => requestSort('totalAvis')}>
                  Avis {getSortIcon('totalAvis')}
                </th>
                <th onClick={() => requestSort('moyenneNote')}>
                  Note {getSortIcon('moyenneNote')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((produit) => (
                <tr key={produit.id}>
                  <td>{produit.name}</td>
                  <td>{produit.price.toFixed(2)} DNT</td>
                  <td>{produit.ventes}</td>
                  <td>{produit.chiffreAffaire.toFixed(2)} DNT</td>
                  <td>{produit.totalAvis}</td>
                  <td>
                    <div className="rating">
                      <span>{produit.moyenneNote}</span>
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < Math.round(produit.moyenneNote) ? 'filled' : ''}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatProduits;