import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StatTopProduits = () => {
  const [produits, setProduits] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/statsadmin/top-produits')
      .then(res => {
        setProduits(res.data.topProduits);
      })
      .catch(err => {
        console.error("Erreur récupération top produits :", err);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Top 5 Produits les plus vendus</h2>
      <table className="min-w-full border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border">Nom</th>
            <th className="px-4 py-2 border">Nombre de ventes</th>
          </tr>
        </thead>
        <tbody>
          {produits.map((produit, index) => (
            <tr key={index} className="text-center">
              <td className="border px-4 py-2">{produit.name}</td>
              <td className="border px-4 py-2">{produit.ventes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatTopProduits;
