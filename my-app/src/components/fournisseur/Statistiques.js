import React, { useState } from 'react';
import '../../Styles/fournisseur/DashboardFournisseur.css';
import StatAvis from './StatAvis';
import StatProduits from './StatProduits';
import StatVentes from './StatVentes';

export default function Statistiques() {
  const [activeTab, setActiveTab] = useState('avis');

  const renderContent = () => {
    switch (activeTab) {
     
      case 'produits':
        return <StatProduits />;
        case 'avis':
          return <StatAvis />;
      case 'ventes':
        return <StatVentes />;
     
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
    
      <div className="sidebar">
        <h3>Statistiques</h3>
        <ul>
        <li onClick={() => setActiveTab('produits')}>📦 Produits</li>
          <li onClick={() => setActiveTab('ventes')}>📈 Ventes</li>
          <li onClick={() => setActiveTab('avis')}>📊 Avis</li>

        </ul>
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}
