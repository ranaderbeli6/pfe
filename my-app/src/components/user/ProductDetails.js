import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';  
import axios from 'axios';
import Header from '../Header';

const ProductDetails = () => {
  const { id } = useParams();  
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/produits/${id}`)
      .then(response => {
        setProduit(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Une erreur est survenue lors de la récupération des détails du produit.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Chargement des détails du produit...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="product-details">
      <Header />
      <h1>{produit.name}</h1>

      <div className="image-container">
        {produit.image ? (
          <img src={`http://localhost:5000${produit.image}`} alt={produit.name} />
        ) : (
          <p>Aucune image disponible</p>
        )}
      </div>

      <p>{produit.description}</p>
      <p>Prix: {produit.price}€</p>
      <p>Stock: {produit.stock}</p>

      {/* Ajout du nom du fournisseur */}
      <p>Fournisseur: {produit.fournisseur ? produit.fournisseur.fullName : "Non spécifié"}</p>
    </div>
  );
};

export default ProductDetails;
