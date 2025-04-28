import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import ResetPasswordRequest from "./components/ResetPasswordRequest";
import ResetPassword from "./components/ResetPassword";
import AuthPage from "./components/AuthPage";
import CatalogueProduits from "./components/user/CatalogueProduits";
import ProductDetails from "./components/user/ProductDetails";
import Home from "./pages/Home";
import ContactForm from "./components/ContactForm";
import FournisseurHome from "./pages/fournisseur/FournisseurHome";
import FournisseurLayout from "./components/fournisseur/FournisseurLayout";
import FournisseurDashboard from "./pages/fournisseur/FournisseurDashboard";
import AddProductForm from "./components/fournisseur/AddProductForm";
import EditProductForm from "./components/fournisseur/EditProductForm";
import Cataloguefournisseur from "./pages/fournisseur/Cataloguefournisseur";
import Panier from "./components/user/Panier";
import AdminLayout from "./components/admin/AdminLayout";
import AdminActivateForm from "./components/admin/AdminActivateForm";
import InviteAdminForm from "./components/admin/InviteAdminForm";
import GestionServicesDashboard from "./components/fournisseur/GestionServicesDashboard";
import UserManagement from "./components/admin/UserManagement";
import AddServiceForm from "./components/fournisseur/AddServiceForm";
import EditServiceForm from "./components/fournisseur/EditServiceForm";
import CatalogueService from "./components/user/CatalogueServices";
import About from "./components/About";
import UserLayout from "./components/user/UserLayout";
import AdminProductsenattenteManagement from "./components/admin/AdminProductsenattenteManagement";
import Orders from "./components/user/orders";
import OrdersManagement from "./components/admin/OrdersManagement";
import AccountManagement from "./components/user/AccountManagement ";
import Statistiques from "./components/fournisseur/Statistiques";
function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/acheteur" element={<Orders />} />
        <Route path="/mon-compte" element={<AccountManagement />} />

        
        <Route path="/login" element={<AuthPage />} />
        <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/catalogue/produits" element={<CatalogueProduits />} />
        <Route path="/catalogue/services" element={<CatalogueService />} />
        <Route path="produits/:id" element={<ProductDetails />} />
        <Route path="form/:id" element={<AdminActivateForm />} />

        <Route path="/about" element={<About />} />

        <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<UserManagement />} />
        

        <Route path="gestion-users" element={<UserManagement />} />
        <Route path="add-user" element={<InviteAdminForm />} />
        <Route path="/admin//gestion-commandes" element={<OrdersManagement />} />

        <Route path="/admin/gestion-produits" element={<AdminProductsenattenteManagement />} />

  
      </Route>
        <Route path="/panier" element={<Panier />} />



        <Route path="/fournisseur" element={<FournisseurLayout />}>
          <Route index element={<FournisseurHome />} />
          <Route path="produits" element={<FournisseurDashboard />} />
          <Route path="produits/ajouter" element={<AddProductForm />} />
          <Route path="produits/modifier/:id" element={<EditProductForm />} />
          <Route path="catalogue" element={<Cataloguefournisseur />} />
          <Route path="services/ajouter" element={<AddServiceForm />} />
          <Route path="/fournisseur/services" element={<GestionServicesDashboard />} />
          <Route path="fournisseur/acheteur" element={<Orders />} />
          <Route path="/fournisseur/suivi-ventes-avis" element={<Statistiques />} />

         
          <Route path="/fournisseur/services/modifier/:id" element={<EditServiceForm />} />
          
          </Route>

          <Route path="/profileacheteur" element={<UserLayout />}>

          <Route index element={<Home />} />

          </Route>
      </Routes>
    </Router>
  );
}

export default App;
