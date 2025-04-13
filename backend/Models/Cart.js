// models/Cart.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true // Null for logged-in users
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true // Null for guests
  },
  status: {
    type: DataTypes.ENUM('actif', 'converti', 'abandonné', 'commandé'),
    defaultValue: 'actif'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'carts',
  indexes: [
    { fields: ['sessionId'] },
    { fields: ['userId'] }
  ]
});

module.exports = Cart;
