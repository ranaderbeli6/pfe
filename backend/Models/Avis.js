const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Avis = sequelize.define('Avis', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    note: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateCreation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    produitId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'produits',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    timestamps: false,
    tableName: 'avis'
  });

  module.exports = Avis;

  