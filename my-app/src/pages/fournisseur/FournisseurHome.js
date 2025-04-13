import React from "react";
import { Link } from "react-router-dom";
import "../../Styles/fournisseur/FournisseurHome.css";

function FournisseurHome() {
  return (
    <div className="fournisseur-home-wrapper">
             <h1>Bienvenue sur votre espace Fournisseur</h1>
        <p>
          Gérez vos produits, suivez vos ventes et ajustez vos paramètres en quelques clics.
          <br />
          Accédez à votre tableau de bord en cliquant sur le bouton ci-dessous.
        </p>
        <Link to="/fournisseur/produits" className="dashboard-button">
          Accéder au Tableau de Bord
        </Link>
      </div>
  );
}

export default FournisseurHome;