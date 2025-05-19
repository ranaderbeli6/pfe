import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/fournisseur/Headerfournisseur.css";
const Headerfournisseur = () => {

  const navigate = useNavigate();

 

  return (
    <div className="header-fournisseur-container" id="header-fournisseur-root">
      

      <div className="header-fournisseur-features-container">
        <button onClick={() => navigate("/fournisseur/produits")}>Gestion des Produits</button>
        <button onClick={() => navigate("/fournisseur/services")}>Gestion des Services</button>
        <button onClick={() => navigate("/fournisseur/suivi-ventes-avis")}>Suivi des Ventes & Avis</button>
        <button onClick={() => navigate("fournisseur/acheteur")}>Vos commandes</button>

      </div>
    </div>
  );
};

export default Headerfournisseur;
