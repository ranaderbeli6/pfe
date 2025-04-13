import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header";
function UserLayout() {
  return (
    <div className="layout-container">
      <header className="main-header">
        <Header />
      </header>


      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;
