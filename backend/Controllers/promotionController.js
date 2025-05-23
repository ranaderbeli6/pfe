const { Op } = require('sequelize');
const Promotion =require ('../Models/Promotion');
const Produit =require ('../Models/Produit')

exports.createPromotion = async (req, res) => {
  try {
    const { produit_id, name, description, discount_type, discount_value, start_date, end_date } = req.body;

    if (!['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ error: "Type de réduction invalide" });
    }

    if (discount_value <= 0) {
      return res.status(400).json({ error: "La valeur de réduction doit être positive" });
    }

    if (discount_type === 'percentage' && discount_value > 100) {
      return res.status(400).json({ error: "Le pourcentage ne peut dépasser 100%" });
    }

    const product = await Produit.findByPk(produit_id);
    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    if (!product.promo_price) {
      await product.update({ promo_price: product.price });
    }

    let newPrice;
    if (discount_type === 'percentage') {
      newPrice = product.promo_price * (1 - discount_value / 100);
    } else {
      newPrice = product.promo_price - discount_value;
    }

    const promotion = await Promotion.create({
      produit_id,
      name,
      description,
      discount_type,
      discount_value,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      created_by: req.user.id,
      is_active: true
    });

    await product.update({
      price: Math.max(newPrice, 0), 
      promotion_end_date: end_date
    });

    res.status(201).json({
      success: true,
      promotion,
      product: {
        id: product.id,
        name: product.name,
        new_price: product.price,
        original_price: product.promo_price
      }
    });

  } catch (error) {
    console.error("Erreur création promotion:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.cancelPromotion = async (req, res) => {
  try {
    const { id } = req.body;

    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      return res.status(404).json({ error: "Promotion non trouvée" });
    }

    const product = await Produit.findByPk(promotion.produit_id);
    if (!product) {
      return res.status(404).json({ error: "Produit associé non trouvé" });
    }

    if (product.promo_price) {
      await product.update({
        price: product.promo_price,
        promo_price: null,
        promotion_end_date: null
      });
    }

    await promotion.update({ is_active: false });

    res.json({
      success: true,
      message: "Promotion annulée avec succès",
      product: {
        id: product.id,
        current_price: product.price
      }
    });

  } catch (error) {
    console.error("Erreur annulation promotion:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.findAll(); 

    if (promotions.length === 0) {
      return res.status(404).json({ message: "Aucune promotion trouvée" });
    }

    res.json({
      success: true,
      promotions,
    });
  } catch (error) {
    console.error("Erreur récupération des promotions:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

