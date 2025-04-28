const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      priceAtPurchase: DataTypes.FLOAT,
      status: {
        type: DataTypes.ENUM('en attente', 'prêt', 'expédié', 'livré'),
        defaultValue: 'en attente'
      }
    }, {
      timestamps: true
    });
    module.exports = OrderItem;