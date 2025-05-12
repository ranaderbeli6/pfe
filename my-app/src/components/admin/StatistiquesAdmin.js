import React, { useState } from 'react';
import '../../Styles/admin/DashboardAdmin.css';
import StatVentesGlobales from './StatVentesGlobales';
import StatProduitsGlobal from './StatProduitsGlobal';
import StatTopProduits from './StatTopProduits';
import StatChiffreAffaireFournisseurs from './StatChiffreAffaireFournisseurs';
import StatTopClients from './StatTopClients';
import StatVentesMensuelles from './StatVentesMensuelles';

function exportToExcel() {
  fetch('http://localhost:5000/api/statsadmin/export/excel')
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'stats.xlsx';
      link.click();
    });
}

export default function StatistiquesAdmin() {
  const [activeTab, setActiveTab] = useState('ventes-globales');

  const renderContent = () => {
    switch (activeTab) {
      case 'ventes-globales':
        return <StatVentesGlobales />;
      case 'produits-global':
        return <StatProduitsGlobal />;
      case 'top-produits':
        return <StatTopProduits />;
      case 'ca-fournisseurs':
        return <StatChiffreAffaireFournisseurs />;
      case 'top-clients':
        return <StatTopClients />;
      case 'ventes-mensuelles':
        return <StatVentesMensuelles />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Statistiques Admin</h3>
        <button onClick={exportToExcel}>Exporter vers Excel</button>

        <ul>
          <li onClick={() => setActiveTab('ventes-globales')}>📊 Ventes Globales</li>
          <li onClick={() => setActiveTab('produits-global')}>📦 Produits Global</li>
          <li onClick={() => setActiveTab('top-produits')}>📈 Top Produits</li>
          <li onClick={() => setActiveTab('ca-fournisseurs')}>💰 Chiffre d'Affaires Fournisseurs</li>
          <li onClick={() => setActiveTab('top-clients')}>👥 Top Clients</li>
          <li onClick={() => setActiveTab('ventes-mensuelles')}>📅 Ventes Mensuelles</li>
        </ul>
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}
 