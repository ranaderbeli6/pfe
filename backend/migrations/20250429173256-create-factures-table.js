// migrations/XXXXXXXXXXXXXX-create-facture.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Factures', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      OrderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id'
        }
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      fournisseurId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      numeroFacture: {
        type: Sequelize.STRING,
        unique: true
      },
      dateEmission: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      dateEcheance: {
        type: Sequelize.DATE
      },
      montantTotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      statut: {
        type: Sequelize.ENUM('brouillon', 'envoyée', 'payée', 'annulée'),
        defaultValue: 'brouillon'
      },
      cheminPDF: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('factures');
  }
};