// migrations/XXXXXXXXXXXXXX-create-ligne-facture.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LigneFactures', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Produits',
          key: 'id'
        }
      },
      quantite: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      prixUnitaire: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      prixTotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      },
      factureId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Factures',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('ligneFactures');
  }
};