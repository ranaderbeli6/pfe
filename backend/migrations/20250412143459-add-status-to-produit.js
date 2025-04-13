module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Produits', 'status', {
      type: Sequelize.ENUM,
      values: ['en_attente', 'approuvé', 'refusé'],
      defaultValue: 'en_attente',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Produits', 'status');
  },
};
