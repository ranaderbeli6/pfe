import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../Styles/user/Catalogueservice.css';
import Header from '../Header';
import defaultImage from '../../images/serviceagricole.png'; 

const Catalogue = () => {
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      axios.get('http://localhost:5000/api/services')  
        .then(response => {
          setServices(response.data);
          setLoading(false);
        })
        .catch(error => {
          setError('Erreur lors de la récupération des services');
          setLoading(false);
        });
    }, []);
  
    const filteredServices = services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return (
      <div className="catalogue-page">
        <Header />
        
        <div className="search-section">
          <input 
            type="text" 
            placeholder="Rechercher un service..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
  
        {loading && <p>Chargement des services...</p>}
        {error && <p>{error}</p>}
  
        <div className="catalogue">
          <div className="services-list">
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <div key={service.id} className="service-card">
                  <div className="image-container">
                    <img 
                      src={service.image ? `http://localhost:5000${service.image}` : defaultImage} 
                      alt={service.name} 
                    />
                  </div>
                  <div className="service-info">
                    <h3>{service.name}</h3>
                    <p><strong>Prix:</strong> {service.price} TND</p>
                    <p><strong>Description:</strong> {service.description}</p>
                    <p><strong>Fournisseur:</strong> {service.providerName}</p>
                    <p><strong>Téléphone:</strong> {service.providerPhone}</p>
                    <p><strong>Diponibilité:</strong> {service.disponibilite}</p>

                  </div>
                </div>
              ))
            ) : (
              <p>Aucun service trouvé</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
export default Catalogue;
