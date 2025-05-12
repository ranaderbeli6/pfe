import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StatChiffreAffaireFournisseurs = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/statsadmin/ca-fournisseurs')
      .then(res => {
        setData(res.data.fournisseurs);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération du CA par fournisseur :", err);
      });
  }, []);

  return (
    <div>
      <h2>Chiffre d’Affaires par Fournisseur</h2>
      <ul>
        {data.map((fournisseur, index) => (
          <li key={index}>
            Fournisseur ID: {fournisseur.fournisseurId} — CA: {fournisseur.ca.toFixed(2)} TND
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatChiffreAffaireFournisseurs;
