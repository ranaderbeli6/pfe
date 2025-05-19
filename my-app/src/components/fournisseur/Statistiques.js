import React, { useState } from 'react';
import '../../Styles/fournisseur/DashboardFournisseur.css';
import StatAvis from './StatAvis';
import StatProduits from './StatProduits';
import StatVentes from './StatVentes';

export default function Statistiques() {
    const [activeTab, setActiveTab] = useState('avis');

    const handleDownloadPdf = () => {
     
        fetch('http://localhost:5000/api/stats/fournisseur/pdf', { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, 
            },
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Erreur lors du téléchargement du PDF');
                });
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `statistiques_ventes_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Erreur de téléchargement PDF:', error);
            alert(error.message); 
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'produits':
                return <StatProduits />;
            case 'avis':
                return <StatAvis />;
            case 'ventes':
                return (
                    <div>
                        <StatVentes />
                        <button className="download-pdf-button" onClick={handleDownloadPdf}>
                            Télécharger les statistiques de ventes en PDF
                        </button>
                    </div>
                );
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