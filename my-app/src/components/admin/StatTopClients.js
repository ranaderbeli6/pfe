import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StatTopClients = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/statsadmin/top-clients')
      .then(res => {
        setClients(res.data);
      })
      .catch(err => {
        console.error("Erreur récupération top clients :", err);
      });
  }, []);

  return (
    <div>
      <h2>Top 5 Clients</h2>
      <h3> Les invités sont les clients non connectés </h3>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Numero de telephone</th>
            <th>Nombre de Commandes </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={index}>
              <td>{client.user ? client.user.fullName : 'invités'}</td>
              <td>{client.user ? client.user.email : 'invités'}</td>
              <td>{client.user ? client.user.phoneNumber : 'invités'}</td>

              <td>{client.ordersCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatTopClients;
