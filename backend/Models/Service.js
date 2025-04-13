const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  providerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  providerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  disponibilite: {
    type: DataTypes.ENUM("Disponible", "Indisponible"),
    defaultValue: "Disponible",
  },
}, {
  tableName: 'services',
  timestamps: true,  

});

module.exports = Service;