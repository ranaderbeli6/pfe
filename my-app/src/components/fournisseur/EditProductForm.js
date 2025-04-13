import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Headerfournisseur';
import '../../Styles/fournisseur/EditProductForm.css';

function EditProductForm() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: '',
    image: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = [ "Semences", "Engrais et Fertilisants", "Matériels Agricoles",
    "Produits Phytosanitaires", "Alimentation Animale", "Élevage",
    "Serres et Irrigation", "Bois et Plantes", "Autres"]; 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/produits/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFormData(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération du produit');
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/products/produits/${id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      navigate('/fournisseur/produits');
    } catch (err) {
      setError('Erreur lors de la modification du produit');
    }
  };

  return (
    <div>
      <div className="edit-product-form">
        <h2>Modifier le Produit</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Prix"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="URL de l'image"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    </div>
  );
}

export default EditProductForm;
