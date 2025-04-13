import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/admin/HeaderAdmin.css"; 

const HeaderAdmin = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Nouvelle commande reçue", read: false },
    { id: 2, message: "Un produit a été ajouté", read: false },
  ]);
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    navigate("/notifications");
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="header-container">
      <div className="left-section">
        <div className="notifications-icon" onClick={handleNotificationClick}>
          <img src={require("../../images/notif.jpg")} alt="Notifications" />
        </div>
      </div>

      <div className="features-container">
        <button onClick={() => navigate("/admin/gestion-users")}>Gestion des Utilisateurs</button>
        <button onClick={() => navigate("/admin/gestion-produits")}>Gestion des Produits</button>
        <button onClick={() => navigate("/admin/gestion-commandes")}>Gestion des Commandes</button>
        <button onClick={() => navigate("/admin/statistiques")}>Statistiques</button>
        <button onClick={() => navigate("/admin/gestion-paiements")}>Gestion des Paiements</button>
      </div>
    </div>
  );
};

export default HeaderAdmin;
