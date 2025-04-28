import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../../Styles/fournisseur/FournisseurDashboard.css';
function FournisseurDashboard() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState(''); 
  const navigate = useNavigate();

  const categories = [
    "Semences",
    "Engrais et Fertilisants",
    "Matériels Agricoles",
    "Produits Phytosanitaires",
    "Alimentation Animale",
    "Élevage",
    "Serres et Irrigation",
    "Bois et Plantes",
    "Autres"
  ];

  useEffect(() => {
    const fetchFournisseurProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products/fournisseur', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProducts(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des produits');
      }
    };
    fetchFournisseurProducts();
  }, []);

  const handleSelect = (id) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((productId) => productId !== id) : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product.id));
    }
  };

const handleDeleteProduct = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/api/products/produits/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    setSuccess('Produit supprimé avec succès.');
    setError('');
  } catch (err) {
    setError(`Erreur lors de la suppression : ${err.response?.data?.message || err.message}`);
  }
};
const handleDeleteSelected = async () => {
  if (selectedProducts.length === 0) {
    setError('Aucun produit sélectionné.');
    return;
  }
  try {
    await axios.delete('http://localhost:5000/api/products/produits/delete-multiple', {
      data: { ids: selectedProducts },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setProducts((prevProducts) => prevProducts.filter((product) => !selectedProducts.includes(product.id)));
    setSelectedProducts([]);
    setSuccess('Produits supprimés avec succès.');
    setError('');
  } catch (err) {
    setError(`Erreur lors de la suppression : ${err.response?.data?.message || err.message}`);
  }
};



  const filteredProducts = products.filter((product) => {
    const matchesSearchTerm = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
    const matchesStock = stockFilter === "épuisé" ? product.stock === 0 : stockFilter === "disponible" ? product.stock > 0 : true;

    return matchesSearchTerm && matchesCategory && matchesStock;
  });

  return (
    <div className='all'>
      <div className="dashboard-content">
        <Link to="/fournisseur/produits/ajouter" className="add-product-btn">
          Ajouter un Produit
        </Link>

        <div className="filter-container">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="stock-filter"
          >
            <option value="">Tous les stocks</option>
            <option value="épuisé">Stock Épuisé</option>
            <option value="disponible">Stock Disponible</option>
          </select>

          <input
            type="text"
            placeholder="Rechercher par nom de produit"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {selectedProducts.length > 0 && (
          <button className="delete-selected-btn" onClick={handleDeleteSelected}>
            Supprimer les produits sélectionnés
          </button>
        )}

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="product-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  />
                </th>
                <th>Nom</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Description</th>
                <th>Catégorie</th>
                <th>Etat</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelect(product.id)}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.price} TND</td>
                    <td>{product.stock}</td>
                    <td>{product.description}</td>
                    <td>{product.category}</td>
                    <td>{product.status}</td>

                    <td>
                      <button className="edit-btn" onClick={() => navigate(`/fournisseur/produits/modifier/${product.id}`)}>
                        Modifier
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">
                  Supprimer
                </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">Aucun produit trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FournisseurDashboard;
