import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../Styles/admin/UserManagement.css";
import { Link } from 'react-router-dom'; // Ajout de Link pour la navigation
import HeaderAdmin from './HeaderAdmin';
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectAll, setSelectAll] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Ne pas afficher admin et superadmin
      const visibleUsers = response.data.filter(
        (user) => user.role !== 'admin' && user.role !== 'superadmin'
      );

      setUsers(visibleUsers);
      setFilteredUsers(visibleUsers);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors de la récupération des utilisateurs");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    filterUsers(value, selectedRole);
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    filterUsers(searchQuery, role);
  };

  const filterUsers = (query, role) => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(query.toLowerCase()) ||
        user.email?.toLowerCase().includes(query.toLowerCase());

      const matchesRole = role === 'all' || user.role === role;

      return matchesSearch && matchesRole;
    });

    setFilteredUsers(filtered);
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/user/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const updateUser = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:5000/api/users/user/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de la mise à jour de l'utilisateur");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="user-management-container">
      <div className="header-section">
        <h2>Gestion des utilisateurs</h2>
        {/* Ajout du lien vers le formulaire d'ajout d'utilisateur */}
        <Link to="/admin/add-user" className="add-btn">
          + Ajouter un admin
        </Link>
      </div>

      <div className="filters">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Recherche par nom ou email"
        />

        <select value={selectedRole} onChange={handleRoleChange}>
          <option value="all">Tous les rôles</option>
          <option value="acheteur">Acheteur</option>
          <option value="fournisseur">Fournisseur</option>
        </select>

        <label>
          <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
          Sélectionner tous
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sélection</th>
            <th>Nom complet</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>
                <input type="checkbox" checked={selectAll} readOnly />
              </td>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => deleteUser(user.id)}>Supprimer</button>
                <button onClick={() => updateUser(user.id, { fullName: 'NouveauNom' })}>
                  Modifier
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
