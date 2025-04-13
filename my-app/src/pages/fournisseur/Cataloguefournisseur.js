import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../Styles/user/Catalogue.css';
import Header from '../../components/Header';
import Headerfournisseur from '../../components/fournisseur/Headerfournisseur';
const Cataloguefournisseur = () => {
    const [produits, setProduits] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/products/produits') 
            .then(response => {
                setProduits(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des produits:', error);
            });
    }, []);

    return (
        <div className="catalogue">
            <h1>Catalogue des Produits</h1>
            <div className="produits-list">
                {produits.map(produit => {
                    console.log('Image du produit:', produit.image);
                    return (
                        <div key={produit.id} className="produit-card">
                            <h2>{produit.name}</h2>
                            <p>{produit.description}</p>
                            <p>Prix: {produit.price}€</p>
                            <p>Stock: {produit.stock}</p>
                            <div className="image-container">
                                {produit.image ? (
                                    <img src={`http://localhost:5000${produit.image}`} alt={produit.name} />
                                ) : (
                                    <p>Aucune image disponible</p>
                                )}
                            </div>

                            <Link to={`/produits/${produit.id}`} className="details-link">Voir les détails</Link>
                        </div>
                    );
                })}
            </div>
        </div>

    );
};

export default Cataloguefournisseur;
