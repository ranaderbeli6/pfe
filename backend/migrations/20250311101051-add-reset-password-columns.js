'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajout des nouvelles colonnes dans la table Users
    await queryInterface.addColumn('Users', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true, // Peut être null initialement
    });
    await queryInterface.addColumn('Users', 'resetPasswordTokenExpiration', {
      type: Sequelize.BIGINT,
      allowNull: true, // Peut être null initialement
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Retirer les colonnes si la migration est annulée
    await queryInterface.removeColumn('Users', 'resetPasswordToken');
    await queryInterface.removeColumn('Users', 'resetPasswordTokenExpiration');
  }
};
