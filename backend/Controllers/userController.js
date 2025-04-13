const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const Service = require('../Models/Service');
const Produit = require('../Models/Produit');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ['password', 'resetPasswordToken', 'resetPasswordTokenExpiration']
      },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(users);
  } catch (err) {
    console.error('Erreur getAllUsers:', err);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['acheteur', 'fournisseur', 'admin', 'superadmin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    const users = await User.findAll({
      where: { role },
      attributes: {
        exclude: ['password']
      }
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(`Erreur lors de la récupération des ${role}s:`, err);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    if (userId === id && req.body.role && req.body.role !== req.user.role) {
      return res.status(403).json({ message: "Vous ne pouvez pas modifier votre propre rôle" });
    }

    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    await user.update(req.body);

    res.status(200).json(user);
  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    if (parseInt(userId) === parseInt(id)) {
      return res.status(403).json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Fournisseur non trouvé." });
    }

    await Service.destroy({ where: { userId: id } });
    await Produit.destroy({ where: { userId: id } });
    await User.destroy({ where: { id } });

    res.status(200).json({ message: "Fournisseur et ses données supprimés avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
  }
};

exports.getUserInfo = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.deleteMultipleUsers = async (req, res) => {
  const { ids } = req.body;
  const adminId = req.user.id;

  try {
    const users = await User.findAll({
      where: {
        id: ids
      }
    });

    if (users.length !== ids.length) {
      return res.status(403).json({ message: 'Accès interdit : certains utilisateurs ne vous appartiennent pas.' });
    }

    await User.destroy({
      where: {
        id: ids
      }
    });

    res.status(200).json({ message: 'Utilisateurs supprimés avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression multiple des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression multiple des utilisateurs', error: error.message });
  }
};
