const { Produit, Order, OrderItem, Avis, User } = require('../Models');

exports.getVentesStats = async (req, res) => {
  try {
    const fournisseurId = req.user.id;
    const { startDate, endDate } = req.query || {};

    const dateFilter = {};
    if (startDate) dateFilter.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate) {
      dateFilter.createdAt = dateFilter.createdAt || {};
      dateFilter.createdAt[Op.lte] = new Date(endDate);
    }

    const commandes = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items',
        where: { fournisseurId },
        include: [{
          model: Produit,
          attributes: ['id', 'name', 'price']
        }]
      }],
      where: { 
        status: ['livré'],
        ...dateFilter 
      },
      order: [['createdAt', 'ASC']]
    });

    const stats = {
      totalVentes: 0,
      chiffreAffaire: 0,
      commandes: commandes.length,
      clientsUnique: new Set(),
      produits: {},
      monthlySales: []
    };

    const monthlyMap = {};
    
    commandes.forEach(commande => {
      stats.clientsUnique.add(commande.userId);
      
      const date = new Date(commande.createdAt);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = {
          mois: monthYear,
          ventes: 0,
          ca: 0
        };
      }

      commande.items.forEach(item => {
        const produit = item.Produit;
        const itemTotal = item.quantity * produit.price;
        
        if (!stats.produits[item.productId]) {
          stats.produits[item.productId] = {
            name: produit.name,
            quantite: 0,
            chiffre: 0
          };
        }
        stats.produits[item.productId].quantite += item.quantity;
        stats.produits[item.productId].chiffre += itemTotal;
        
        stats.totalVentes += item.quantity;
        stats.chiffreAffaire += itemTotal;
        
        monthlyMap[monthYear].ventes += item.quantity;
        monthlyMap[monthYear].ca += itemTotal;
      });
    });

    stats.monthlySales = Object.values(monthlyMap).sort((a, b) => {
      return new Date(a.mois) - new Date(b.mois);
    });

    stats.monthlySales = stats.monthlySales.map(month => ({
      ...month,
      mois: new Date(month.mois).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    }));

    stats.clientsUnique = stats.clientsUnique.size;

    res.status(200).json(stats);
  } catch (err) {
    console.error("Erreur stats ventes:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des stats de ventes." });
  }
};

exports.getAvisStats = async (req, res) => {
    try {
      const fournisseurId = req.user.id;
  
      const avis = await Avis.findAll({
        include: [{
          model: Produit,
          as: 'produit', 
          where: { userId: fournisseurId },
          attributes: ['id']
        }]
      });
  
      const stats = {
        totalAvis: avis.length,
        moyenneNote: 0,
        repartitionNotes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
  
      if (avis.length > 0) {
        const sommeNotes = avis.reduce((acc, a) => {
          stats.repartitionNotes[a.note]++;
          return acc + a.note;
        }, 0);
        stats.moyenneNote = (sommeNotes / avis.length).toFixed(2);
      }
  
      res.status(200).json(stats);
    } catch (err) {
      console.error("Erreur stats avis:", err);
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques d'avis." });
    }
  };
  
exports.getProduitsStats = async (req, res) => {
    try {
      const fournisseurId = req.user.id;
  
      const produits = await Produit.findAll({
        where: { userId: fournisseurId },
        include: [
          {
            model: OrderItem,
            attributes: ['quantity'],
            include: [{
              model: Order,
              where: { status: ['livré'] },
              attributes: []
            }]
          },
          {
            model: Avis,
            as: 'avis', 
            attributes: ['note']
          }
        ]
      });
  
      const stats = produits.map(produit => {
        const ventes = produit.OrderItems.reduce((acc, item) => acc + item.quantity, 0);
        const chiffreAffaire = ventes * produit.price;
  
        const notes = produit.avis.map(a => a.note);
        const moyenneNote = notes.length > 0
          ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)
          : 0;
  
        return {
          id: produit.id,
          name: produit.name,
          price: produit.price,
          ventes,
          chiffreAffaire,
          totalAvis: notes.length,
          moyenneNote
        };
      });
  
      res.status(200).json({ produits: stats });
    } catch (err) {
      console.error("Erreur stats produits:", err);
      res.status(500).json({ message: "Erreur lors de la récupération des stats produits." });
    }
  };
