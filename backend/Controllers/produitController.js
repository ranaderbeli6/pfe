const { Sequelize } = require('sequelize');
const Produit = require('../Models/Produit');
const path = require('path');
const CartItem = require('../Models/CartItem');

exports.getProduits = async (req, res) => {
  try {
      console.log('Utilisateur connecté:', req.user); 

      const produits = await Produit.findAll({ where: { status: 'approuvé' } });
      res.json(produits);

  } catch (error) {
      console.error('Erreur serveur:', error);
      res.status(500).json({ message: "Erreur serveur", error });
  }
};
exports.getProduitsFournisseur = async (req, res) => {
  try {
      const produits = await Produit.findAll({ where: { userId: req.user.id } });
      res.json(produits);
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
  }
};


exports.addProduit = async (req, res) => {
  const { name, price, stock, description, category } = req.body;
  const fournisseurId = req.user.id;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !price || !stock || !description || !category) {
    return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
  }

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ message: 'Le prix doit être un nombre positif.' });
  }

  if (isNaN(stock) || stock < 0) {
    return res.status(400).json({ message: 'Le stock doit être un nombre positif ou nul.' });
  }

  try {
    // Création du produit avec le statut "en_attente"
    const produit = await Produit.create({
      name,
      price,
      stock,
      description,
      category,
      image,
      userId: fournisseurId,
      status: 'en_attente',  // Statut "en_attente" par défaut
    });

    res.status(201).json({ message: 'Produit ajouté avec succès, en attente de validation.', produit });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    res.status(500).json({ message: 'Erreur lors de la création du produit', error: error.message });
  }
};

// recup produits selon statut
exports.getProduitsParStatut = async (req, res) => {
  const { statut } = req.params;  // "en_attente", "approuvé", ou "refusé"

  try {
    // Vérification de la validité du statut
    if (!['en_attente', 'approuvé', 'refusé'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    const produits = await Produit.findAll({ where: { status: statut } });

    res.status(200).json(produits);
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


// recup tous 
exports.getProduitsApprouves = async (req, res) => {
  try {
    const produits = await Produit.findAll({ where: { status: 'approuvé' } });

    res.status(200).json(produits);
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.updateProduit = async (req, res) => {
  const produitId = req.params.id;
  const { name, price, stock, description, category, image } = req.body;
  const fournisseurId = req.user.id;

  try {
    const produit = await Produit.findOne({ where: { id: produitId } });

    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    if (produit.userId !== fournisseurId) {
      return res.status(403).json({ message: 'Accès interdit : produit non associé à ce fournisseur.' });
    }

    await produit.update({
      name,
      price,
      stock,
      description,
      category,
      image,
    });

    res.status(200).json(produit);
  } catch (error) {
    console.error('Erreur lors de la modification du produit:', error);
    res.status(500).json({ message: 'Erreur lors de la modification du produit', error: error.message });
  }
};

exports.deleteProduit = async (req, res) => {
  const produitId = req.params.id;
  const fournisseurId = req.user.id;

  try {
    const produit = await Produit.findOne({ where: { id: produitId } });

    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    if (produit.userId !== fournisseurId) {
      return res.status(403).json({ message: 'Accès interdit : produit non associé à ce fournisseur.' });
    }

    await produit.destroy();
    res.status(200).json({ message: 'Produit supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du produit', error: error.message });
  }
};
exports.deleteMultipleProduits = async (req, res) => {
  const { ids } = req.body;
  const fournisseurId = req.user.id;

  try {
    console.log('IDs reçus :', ids); 

    const produits = await Produit.findAll({
      where: {
        id: ids,
        userId: fournisseurId,
      },
    });
    console.log('Produits trouvés :', produits); 

    if (produits.length !== ids.length) {
      return res.status(403).json({ message: 'Accès interdit : certains produits ne vous appartiennent pas.' });
    }

    await Produit.destroy({
      where: {
        id: ids,
      },
    });

    res.status(200).json({ message: 'Produits supprimés avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression multiple des produits:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression multiple des produits', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  const produitId = req.params.id;

  try {
    const produit = await Produit.findOne({ 
      where: { id: produitId }
    });

    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    res.status(200).json(produit);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};








exports.getProduitsEnAttente = async (req, res) => {
  try {
    const produitsEnAttente = await Produit.findAll({ where: { status: 'en_attente' } });

    if (!produitsEnAttente || produitsEnAttente.length === 0) {
      return res.status(404).json({ message: 'Aucun produit en attente trouvé' });
    }

    res.status(200).json(produitsEnAttente);
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};


exports.accepterProduit = async (req, res) => {
  const produitId = req.params.id;

  try {
    const produit = await Produit.findOne({ where: { id: produitId } });

    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    if (produit.status === 'approuvé') {
      return res.status(400).json({ message: 'Ce produit est déjà approuvé.' });
    }

    if (produit.status === 'refusé') {
      return res.status(400).json({ message: 'Un produit refusé ne peut pas être approuvé.' });
    }

    await produit.update({ status: 'approuvé' });
    
    res.status(200).json({ 
      message: 'Produit approuvé avec succès.', 
      produit: {
        id: produit.id,
        name: produit.name,
        status: produit.status
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'approbation du produit:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'approbation du produit', 
      error: error.message 
    });
  }
};

exports.refuserProduit = async (req, res) => {
  const produitId = req.params.id;

  try {
    const produit = await Produit.findOne({ where: { id: produitId } });

    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    if (produit.status === 'refusé') {
      return res.status(400).json({ message: 'Ce produit est déjà refusé.' });
    }

    if (produit.status === 'approuvé') {
      return res.status(400).json({ message: 'Un produit approuvé ne peut pas être refusé.' });
    }

    await produit.update({ status: 'refusé' });

    res.status(200).json({ 
      message: 'Produit refusé avec succès.', 
      produit: {
        id: produit.id,
        name: produit.name,
        status: produit.status
      }
    });

  } catch (error) {
    console.error('Erreur lors du refus du produit:', error);
    res.status(500).json({ 
      message: 'Erreur lors du refus du produit', 
      error: error.message 
    });
  }
};
