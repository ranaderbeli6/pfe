import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../../Styles/fournisseur/GestionServicesDashboard.css"; 

function GestionServicesDashboard() {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [disponibiliteFilter, setDisponibiliteFilter] = useState(""); 
  const navigate = useNavigate();

  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 5000);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/services/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setServices(response.data);
      } catch (err) {
        setError("Erreur lors de la récupération des services");
        clearMessages();  
      }
    };
    fetchServices();
  }, []);

  const handleSelect = (id) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((serviceId) => serviceId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map((service) => service.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedServices.length === 0) {
      setError("Aucun service sélectionné.");
      clearMessages();
      return;
    }
    try {
      await axios.delete("http://localhost:5000/api/services/produits/delete-multiple", {
        data: { ids: selectedServices },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setServices((prevServices) => prevServices.filter((service) => !selectedServices.includes(service.id)));
      setSelectedServices([]);
      setSuccess("Services supprimés avec succès.");
      setError("");
      clearMessages();  
    } catch (err) {
      setError(`Erreur lors de la suppression : ${err.response?.data?.message || err.message}`);
      clearMessages();
    }
  };

  const handleDeleteSingle = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/services/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setServices((prevServices) => prevServices.filter((service) => service.id !== id));
      setSuccess("Service supprimé avec succès.");
      setError("");
      clearMessages();
    } catch (err) {
      setError(`Erreur lors de la suppression : ${err.response?.data?.message || err.message}`);
      clearMessages();
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearchTerm = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDisponibilite = disponibiliteFilter ? service.disponibilite === disponibiliteFilter : true;
    return matchesSearchTerm && matchesDisponibilite;
  });

  return (
    <div className="gestion-services-wrapper">
    
      <Link to="/fournisseur/services/ajouter">
        <button className="add-service-btn">Ajouter un service</button>
      </Link>

      <div className="filter-container">
        <input
          type="text"
          placeholder="Rechercher par nom de service"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={disponibiliteFilter}
          onChange={(e) => setDisponibiliteFilter(e.target.value)}
          className="disponibilite-filter"
        >
          <option value="">Disponibilité</option>
          <option value="Disponible">Disponible</option>
          <option value="Indisponible">Indisponible</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="services-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
                />
              </th>
              <th>Nom</th>
              <th>Prix</th>
              <th>Description</th>
              <th>Disponibilité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <tr key={service.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleSelect(service.id)}
                    />
                  </td>
                  <td>{service.name}</td>
                  <td>{service.price} TND</td>
                  <td>{service.description}</td>
                  <td>{service.disponibilite}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/fournisseur/services/modifier/${service.id}`)}
                    >
                      Modifier
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteSingle(service.id)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Aucun service trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="delete-selected-btn" onClick={handleDeleteSelected}>
        Supprimer les services sélectionnés
      </button>
    </div>
  );
}

export default GestionServicesDashboard;
