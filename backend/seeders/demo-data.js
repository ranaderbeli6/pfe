const db = require('../Models');
const { Produit } = db;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await Produit.bulkCreate([
        {
          nom: "Tomates",
          description: "Tomates fraîches",
          prix: 10.5,
          stock: 100,
          categorie: "Légumes",
        },
        {
          nom: "Pommes",
          description: "Pommes biologiques",
          prix: 8.0,
          stock: 50,
          categorie: "Fruits",
        },
        {
          nom: "Engrais",
          description: "Engrais naturel",
          prix: 15.0,
          stock: 30,
          categorie: "Équipements",
        },
      ]);

      console.log("Produits insérés avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'insertion des produits :", error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await Produit.destroy({ where: {} });
  },
};
