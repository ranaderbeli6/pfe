import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header";
import Headerfournisseur from "./Headerfournisseur";
import '../../Styles/fournisseur/FournisseurLayout.css';
function FournisseurLayout() {
  return (
    <div className="layout-container">
      <header className="main-header">
        <Header />
      </header>

      <header className="fournisseur-header">
        <Headerfournisseur />
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default FournisseurLayout;
