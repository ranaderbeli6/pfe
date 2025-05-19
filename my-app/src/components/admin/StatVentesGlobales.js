import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { FaChartLine, FaBoxes, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import '../../Styles/admin/StatVentesGlobales.css'; 

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatVentesGlobales = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/statsadmin/ventes-globales')
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur lors de la récupération des statistiques globales :', err);
                setError('Erreur lors du chargement des statistiques.');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Chargement des statistiques...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    if (!stats) {
        return null;
    }

    const monthlySalesData = stats.monthlySales.map(mois => ({
        mois: mois.mois,
        ventes: mois.ventes,
        ca: mois.ca,
    }));

    const topProductsData = Object.entries(stats.produits)
        .sort(([, a], [, b]) => b.quantite - a.quantite)
        .slice(0, 5)
        .map(([id, produit], index) => ({
            name: produit.name,
            quantite: produit.quantite,
            chiffre: produit.chiffre,
            fill: COLORS[index % COLORS.length],
        }));

    const totalRevenue = stats.chiffreAffaire;

    return (
        <div className="stat-ventes-globales-container">
            <h2><FaChartLine /> Statistiques Globales des Ventes</h2>

            <div className="kpi-container">
                <div className="kpi-card">
                    <FaBoxes className="kpi-icon" />
                    <h3>Commandes</h3>
                    <p>{stats.commandes}</p>
                </div>
                <div className="kpi-card">
                    <FaBoxes className="kpi-icon" />
                    <h3>Produits Vendus</h3>
                    <p>{stats.totalVentes}</p>
                </div>
                <div className="kpi-card">
                    <FaMoneyBillWave className="kpi-icon" />
                    <h3>Chiffre d'Affaires Total</h3>
                    <p>{stats.chiffreAffaire.toFixed(2)} TND</p>
                </div>
                <div className="kpi-card">
                    <FaUsers className="kpi-icon" />
                    <h3>Clients Uniques</h3>
                    <p>{stats.clientsUnique}</p>
                </div>
            </div>

            <div className="chart-section">
                <h3><FaChartLine /> Évolution Mensuelle</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mois" />
                        <YAxis yAxisId="left" label={{ value: 'Nombre de ventes', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Chiffre d\'affaires (TND)', angle: 90, position: 'insideRight' }} />
                        <Tooltip formatter={(value, name) => name === 'ca' ? `${value.toFixed(2)} TND` : value} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="ventes" stroke="#8884d8" name="Ventes" activeDot={{ r: 8 }} />
                        <Line yAxisId="right" type="monotone" dataKey="ca" stroke="#82ca9d" name="Chiffre d'affaires" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-section">
                <h3><FaBoxes /> Top 5 Produits Vendus (Quantité)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProductsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Quantité vendue', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="quantite">
                            {topProductsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-section">
                <h3><FaMoneyBillWave /> Répartition du Chiffre d'Affaires (Top 5 Produits)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={topProductsData}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            dataKey="chiffre"
                            nameKey="name"
                            label={({ name, chiffre, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {topProductsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(2)} TND`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatVentesGlobales;