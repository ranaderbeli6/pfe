import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  LabelList, Legend
} from 'recharts';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import '../../Styles/fournisseur/StatAvis.css';

const COLORS = ['#FF6B6B', '#FFA36B', '#FFD56B', '#A3D8FF', '#6BCBFF'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Note ${label} : ${payload[0].value} avis`}</p>
        <p className="desc">{`${Math.round((payload[0].value / payload[0].payload.total) * 100)}% des avis`}</p>
      </div>
    );
  }
  return null;
};

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} className="star filled" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<FaStarHalfAlt key={i} className="star half-filled" />);
    } else {
      stars.push(<FaRegStar key={i} className="star" />);
    }
  }

  return <div className="star-rating">{stars}</div>;
};

export default function StatAvis() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/stats/fournisseur/avis', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setStats(res.data);
        setError(null);
      } catch (err) {
        console.error("Erreur chargement des stats avis", err);
        setError("Impossible de charger les statistiques. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Chargement des statistiques...</p>
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;

  if (!stats) return null;

  const data = Object.entries(stats.repartitionNotes).map(([note, count]) => ({
    note: `${note} étoile${note > 1 ? 's' : ''}`,
    count,
    total: stats.totalAvis
  }));

  return (
    <div className="stat-avis-container">
      <h2>Statistiques des Avis Clients</h2>
      
      <div className="stats-overview">
        <div className="overview-card">
          <h3>Total des Avis</h3>
          <p className="stat-value">{stats.totalAvis}</p>
        </div>
        
        <div className="overview-card">
          <h3>Note Moyenne</h3>
          <div className="average-rating">
            <span className="rating-value">{stats.moyenneNote}</span>
            <StarRating rating={parseFloat(stats.moyenneNote)} />
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Répartition des Notes</h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="note" 
                label={{ value: 'Notes', position: 'insideBottom', offset: -10 }} 
              />
              <YAxis 
                allowDecimals={false} 
                label={{ value: "Nombre d'avis", angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" name="Nombre d'avis">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.totalAvis === 0 && (
        <div className="no-reviews">
          <p>Vous n'avez pas encore reçu d'avis.</p>
        </div>
      )}
    </div>
  );
}