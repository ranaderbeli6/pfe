const { Avis, Produit, User } = require('../Models');

exports.createAvis = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(403).json({ message: 'Utilisateur non identifié.' });
    }

    const { note, commentaire, produitId } = req.body;

    if (!produitId || isNaN(note)) {
      return res.status(400).json({ message: 'Données invalides.' });
    }

    const produit = await Produit.findByPk(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    const avis = await Avis.create({
      note: parseInt(note),
      commentaire: commentaire || null,
      produitId,
      userId: req.user.id
    });

    return res.status(201).json(avis);

  } catch (error) {
    console.error('Erreur création avis:', error);
    return res.status(500).json({ 
      message: 'Erreur serveur',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

exports.getAvisByProduit = async (req, res) => {
  try {
    const { produitId } = req.params;

    if (!produitId) {
      return res.status(400).json({ message: "Produit ID manquant." });
    }

    const avis = await Avis.findAll({
      where: { produitId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    return res.status(200).json(avis.length === 0 ? [] : avis);
  } catch (err) {
    console.error("Erreur lors de la récupération des avis:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des avis." });
  }
};

exports.updateAvis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { note, commentaire } = req.body;

    if (note !== undefined && (isNaN(note) || note < 1 || note > 5)) {
      return res.status(400).json({ message: 'La note doit être un nombre entre 1 et 5.' });
    }

    const avis = await Avis.findOne({ where: { id, userId } });
    if (!avis) {
      return res.status(404).json({ message: "Avis non trouvé ou non autorisé." });
    }

    if (note !== undefined) avis.note = note;
    if (commentaire !== undefined) avis.commentaire = commentaire || null;

    await avis.save();

    res.status(200).json(avis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la modification de l'avis." });
  }
};

exports.deleteAvis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const avis = await Avis.findOne({ where: { id, userId } });
    if (!avis) return res.status(404).json({ message: "Avis non trouvé." });

    await avis.destroy();
    res.status(200).json({ message: "Avis supprimé avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};
