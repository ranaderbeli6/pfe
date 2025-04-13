import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header";
import HeaderAdmin from "./HeaderAdmin"; 
import '../../Styles/admin/AdminLayout.css';

function AdminLayout() {
  return (
    <div className="layout-container">
      <header className="main-header">
        <Header />
      </header>

      <header className="admin-header">
        <HeaderAdmin />
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
