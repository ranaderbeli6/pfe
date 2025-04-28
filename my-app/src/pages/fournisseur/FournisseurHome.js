import React from "react";
import { FaBoxes, FaChartLine, FaClipboardCheck, FaCogs, FaRegSmile } from "react-icons/fa";
import "../../Styles/fournisseur/FournisseurHome.css";

function FournisseurHome() {
  return (
    <div className="fournisseur-home-container">
      <div className="welcome-hero">
        <h1>Bienvenue dans votre Espace Fournisseur</h1>
        <p className="subtitle">
          Ici, vous pouvez gérer efficacement votre activité commerciale
        </p>
        <div className="welcome-icon">
          <FaRegSmile size={48} />
        </div>
      </div>

      <div className="features-overview">
        <div className="feature-card">
          <div className="feature-icon">
            <FaBoxes size={32} />
          </div>
          <h3>Gestion des Produits</h3>
          <p>
            Créez, modifiez et organisez votre catalogue produits en quelques clics.
            Suivez vos stocks et disponibilités .
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaClipboardCheck size={32} />
          </div>
          <h3>Suivi des Commandes</h3>
          <p>
            Consultez l'historique de vos commandes passées par vous.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaChartLine size={32} />
          </div>
          <h3>Statistiques Avancées</h3>
          <p>
            Analysez vos performances avec nos tableaux de bord interactifs.
            Identifiez vos produits phares et tendances saisonnières.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaCogs size={32} />
          </div>
          <h3>Paramètres Compte</h3>
          <p>
            Personnalisez votre compte et configurez vos préférences.
            Gérez vos informations .
          </p>
        </div>
      </div>

      <div className="quick-tips">
        <h2>Pour bien commencer</h2>
        <ul className="tips-list">
          <li>Complétez votre profil fournisseur pour une meilleure visibilité</li>
          <li>Ajoutez des photos de qualité pour vos produits</li>
          <li>Consultez régulièrement vos statistiques pour adapter votre stratégie</li>
          <li>Mettez à jour vos disponibilités pour éviter les ruptures</li>
        </ul>
      </div>

      <div className="support-section">
        <h3>Besoin d'aide ?</h3>
        <p>
          Notre équipe support est disponible pour vous accompagner dans l'utilisation de la plateforme.
          <br />
          Utilisez le menu latéral pour accéder à toutes les fonctionnalités.
        </p>
      </div>
    </div>
  );
}

export default FournisseurHome;