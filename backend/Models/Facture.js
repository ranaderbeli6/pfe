const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Facture = sequelize.define('Facture', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  OrderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fournisseurId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numeroFacture: {
    type: DataTypes.STRING,
    unique: true
  },
  dateEmission: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dateEcheance: {
    type: DataTypes.DATE
  },
  montantTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('brouillon', 'envoyée', 'payée', 'annulée'),
    defaultValue: 'brouillon'
  },
  cheminPDF: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

module.exports = Facture;