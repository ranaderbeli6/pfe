import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/fournisseur/Headerfournisseur.css";
const Headerfournisseur = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Stock épuisé pour le produit X", read: false },
  ]);
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    navigate("/notifications");
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="header-fournisseur-container" id="header-fournisseur-root">
      <div className="header-fournisseur-left-section">
        <div 
          className={`header-fournisseur-notifications-icon ${notifications.some(n => !n.read) ? 'has-unread' : ''}`} 
          onClick={handleNotificationClick}
        >
          <img src={require("../../images/notif.jpg")} alt="Notifications" />
        </div>
      </div>

      <div className="header-fournisseur-features-container">
        <button onClick={() => navigate("/fournisseur/produits")}>Gestion des Produits</button>
        <button onClick={() => navigate("/fournisseur/services")}>Gestion des Services</button>
        <button onClick={() => navigate("/suivi-ventes-avis")}>Suivi des Ventes & Avis</button>
      </div>
    </div>
  );
};

export default Headerfournisseur;
