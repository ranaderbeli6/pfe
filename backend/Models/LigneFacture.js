const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LigneFacture = sequelize.define('LigneFacture', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  prixUnitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  prixTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.STRING
  },
  factureId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  hooks: {
    beforeValidate: (ligne) => {
      if (ligne.prixUnitaire && ligne.quantite) {
        ligne.prixTotal = ligne.prixUnitaire * ligne.quantite;
      }
    }
  }
});

module.exports = LigneFacture;