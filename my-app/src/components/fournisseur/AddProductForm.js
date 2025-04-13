import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../Styles/fournisseur/AddProductForm.css';

function AddProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: '',
    image: null,
  });

  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "Semences", "Engrais et Fertilisants", "Matériels Agricoles",
    "Produits Phytosanitaires", "Alimentation Animale", "Élevage",
    "Serres et Irrigation", "Bois et Plantes", "Autres"
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const finalCategory = formData.category === "Autres" ? customCategory : formData.category;

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('stock', formData.stock);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', finalCategory);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      await axios.post('http://localhost:5000/api/products/add', formDataToSend, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(false);
      navigate('/fournisseur/produits');
    } catch (err) {
      setLoading(false);
      setError("Erreur lors de l'ajout du produit. Veuillez réessayer.");
    }
  };

  return (
    <div>
      <div className="add-product-form">
        <h2>Ajouter un Produit</h2>
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
            min="0"
          />
          <input
            type="number"
            placeholder="Stock"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
            min="0"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="category-container">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {formData.category === "Autres" && (
            <input
              type="text"
              placeholder="Entrez votre catégorie"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {preview && <img src={preview} alt="Aperçu" className="image-preview" />}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Ajout en cours...' : 'Ajouter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProductForm;
