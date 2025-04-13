'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modifie la colonne 'role' pour ajouter les nouvelles valeurs
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('acheteur', 'fournisseur', 'admin', 'superadmin'),
      defaultValue: 'acheteur',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Si tu veux annuler cette migration, enlève les nouvelles valeurs
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('acheteur', 'fournisseur'),
      defaultValue: 'acheteur',
    });
  }
};
