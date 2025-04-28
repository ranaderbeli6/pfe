const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true 
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true 
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('en attente', 'payé', 'expédié', 'livré', 'annulé'),
    defaultValue: 'en attente'
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  billingAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true ,
    validate: {
      isEmail: true
    }
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true 
  },
  buyerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
}, {
  tableName: 'orders',
  timestamps: true
});

module.exports = Order;