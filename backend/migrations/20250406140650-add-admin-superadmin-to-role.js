'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('acheteur', 'fournisseur', 'admin', 'superadmin'),
      defaultValue: 'acheteur',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('acheteur', 'fournisseur'),
      defaultValue: 'acheteur',
    });
  }
};
