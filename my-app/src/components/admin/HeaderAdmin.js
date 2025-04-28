import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/admin/HeaderAdmin.css"; 

const HeaderAdmin = () => {
 
  const navigate = useNavigate();



  return (
    <div className="header-container">
      <div className="left-section">
      
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
