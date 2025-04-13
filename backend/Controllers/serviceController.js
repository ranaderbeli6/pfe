const Service = require('../Models/Service');
const User = require('../Models/User');

exports.addService = async (req, res) => {
  const { name, price, description, image, disponibilite } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const service = await Service.create({
      name,
      price,
      description,
      providerName: user.fullName,
      providerPhone: user.phoneNumber,
      image,
      disponibilite, 
      userId,
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Erreur lors de la création du service:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du service', error: error.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      include: {
        model: User,
        attributes: ['fullName', 'phoneNumber', 'address', 'email'],
      }
    });

    res.status(200).json(services);
  } catch (error) {
    console.error('Erreur fetch services:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des services" });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: {
        model: User,
        attributes: ['fullName', 'phoneNumber', 'address'],
      }
    });

    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service || service.userId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à modifier ce service" });
    }

    const { nom, prix, description, disponibilite } = req.body;
    const image = req.file ? req.file.filename : service.image;

    await service.update({ nom, prix, description, image, disponibilite }); // disponibilité ajoutée

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service || service.userId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à supprimer ce service" });
    }

    await service.destroy();

    res.status(200).json({ message: "Service supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

exports.getServicesFournisseur = async (req, res) => {
  try {
    const userId = req.user.id;
    const services = await Service.findAll({
      where: { userId },
    });

    res.status(200).json(services);
  } catch (error) {
    console.error('Erreur fetch services fournisseur:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteMultipleServices = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Liste des IDs manquante ou vide" });
    }

    const deleted = await Service.destroy({
      where: {
        id: ids
      }
    });

    res.status(200).json({ message: `${deleted} service(s) supprimé(s)` });
  } catch (error) {
    console.error("Erreur suppression multiple:", error);
    res.status(500).json({ message: "Erreur lors de la suppression multiple" });
  }
};

exports.getServicesDisponibles = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { disponibilite: 'Disponible' },
      include: {
        model: User,
        attributes: ['fullName', 'phoneNumber', 'address'],
      }
    });

    res.status(200).json(services);
  } catch (error) {
    console.error('Erreur récupération services disponibles:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
