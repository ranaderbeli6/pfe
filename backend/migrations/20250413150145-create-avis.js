module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('avis', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      note: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      commentaire: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dateCreation: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      produitId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'produits',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.addConstraint('avis', {
      fields: ['produitId', 'userId'],
      type: 'unique',
      name: 'unique_user_product_review'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('avis');
  }
};
