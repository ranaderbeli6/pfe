const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Facture = sequelize.define('Facture', {
      numero: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      fraisLivraison: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 8.00
      },
      montantTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      methodePaiement: {
        type: DataTypes.STRING,
        defaultValue: 'À la livraison'
      }
    });
  
    Facture.associate = (models) => {
      Facture.belongsTo(models.Order, { foreignKey: 'orderId' });
      Facture.belongsTo(models.User, { foreignKey: 'clientId' });
    };
  
    module.exports = Facture;
