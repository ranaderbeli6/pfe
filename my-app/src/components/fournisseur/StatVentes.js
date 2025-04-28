import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { FaShoppingCart, FaMoneyBillWave, FaBoxes, FaChartLine, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../Styles/fournisseur/StatVentes.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatVentes = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        let url = 'http://localhost:5000/api/stats/fournisseur/ventes';
        const params = new URLSearchParams();
        
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());

        const response = await axios.get(`${url}?${params.toString()}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setStats(response.data);
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la récupération des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [startDate, endDate]);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return null;

  const topProduitsData = Object.entries(stats.produits)
    .map(([id, produit]) => ({
      id,
      name: produit.name,
      value: produit.chiffre,
      quantite: produit.quantite,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="stat-ventes-container">
      <h1>Statistiques des Ventes</h1>

   
      {/* Résumé des KPI */}
      <div className="kpi-container">
        <div className="kpi-card">
          <FaShoppingCart className="kpi-icon" />
          <h3>Commandes</h3>
          <p>{stats.commandes}</p>
        </div>
        <div className="kpi-card">
          <FaBoxes className="kpi-icon" />
          <h3>Ventes</h3>
          <p>{stats.totalVentes}</p>
        </div>
        

        <div className="kpi-card">
          <FaMoneyBillWave className="kpi-icon" />
          <h3>Chiffre d'Affaires</h3>
          <p>{stats.chiffreAffaire.toFixed(2)} DNT</p>
        </div>
        <div className="kpi-card">
          <FaUsers className="kpi-icon" />
          <h3>Clients Uniques</h3>
          <p>{stats.clientsUnique}</p>
        </div>
      </div>

      <div className="chart-section">
        <h2>
          <FaChartLine /> Évolution Mensuelle
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={stats.monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => 
                name === 'CA' ? [`${value.toFixed(2)} DNT`, name] : [value, name]
              }
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ventes"
              name="Quantité vendue"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ca"
              name="Chiffre d'affaires (DNT)"
              stroke="#82ca9d"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top produits */}
      <div className="chart-section">
        <h2>
          <FaBoxes /> Top 5 Produits
        </h2>
        <div className="double-chart">
          <div className="chart-wrapper">
            <h3>Par chiffre d'affaires</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProduitsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(2)} DNT`, "CA"]}
                />
                <Bar dataKey="value">
                  {topProduitsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h3>Répartition des quantités</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProduitsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="quantite"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {topProduitsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, "Quantité"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="productstable">
        <h2>Détails par produit</h2>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité vendue</th>
              <th>Chiffre d'affaires</th>
              <th>Part du CA</th>
            </tr>
          </thead>
          <tbody>
            {topProduitsData.map((produit) => (
              <tr key={produit.id}>
                <td>{produit.name}</td>
                <td>{produit.quantite}</td>
                <td>{produit.value.toFixed(2)} DNT</td>
                <td>
                  {((produit.value / stats.chiffreAffaire) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatVentes;