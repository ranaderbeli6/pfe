const { Order, OrderItem, Produit, User, Cart, CartItem, sequelize } = require('../Models');


exports.createOrder = async (req, res) => {
  try {
    const { paymentMethod, shippingAddress } = req.body; // récupère aussi shippingAddress du body
    const user = await User.findByPk(req.user.id);
    const userId = user.id;

    if (!paymentMethod) {
      return res.status(400).json({ message: "Méthode de paiement requise." });
    }

    const cart = await Cart.findOne({
      where: { userId },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: Produit,
          attributes: ['id', 'stock', 'userId', 'name', 'price'],
          required: true
        }]
      }]
    });

    if (!cart || !cart.items?.length) {
      return res.status(404).json({ message: "Panier vide ou introuvable." });
    }

    const orderItemsData = [];
    let totalAmount = 0;

    for (const item of cart.items) {

      orderItemsData.push({
        productId: item.productId,
        fournisseurId: item.Produit.userId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtAddition || item.Produit.price,
        status: 'en attente'
      });

      totalAmount += (item.priceAtAddition || item.Produit.price) * item.quantity;
    }



    const order = await Order.create({
      userId,
      cartId: cart.id,
      totalAmount,
      status: 'en attente',
      paymentMethod,
      shippingAddress: shippingAddress,
      contactEmail: user.email,
      buyerName: user.fullName,
      contactPhone: user.phoneNumber
    });
await CartItem.destroy({ where: { cartId: cart.id } });


    const createdOrderItems = await OrderItem.bulkCreate(
      orderItemsData.map(item => ({
        ...item,
        orderId: order.id
      }))
    );

  
    return res.status(201).json({
      message: "Commande créée avec succès.",
      order: {
        id: order.id,
        userId: order.userId,
        cartId: order.cartId,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        contactEmail: order.contactEmail,
        buyerName: order.buyerName,
        contactPhone: order.contactPhone,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },
      order_items: createdOrderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        fournisseurId: item.fournisseurId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        status: item.status
      }))
    });

  } catch (error) {
    console.error("Erreur création commande:", error);
    return res.status(500).json({ 
      message: "Erreur serveur lors de la création de la commande",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.getFournisseurOrders = async (req, res) => {
  const orders = await Order.findAll({
    include: [{
      model: OrderItem,
      as: 'items',
      where: { fournisseurId: req.user.id },
      include: [
        { model: Produit, attributes: ['id', 'name'] },
        { model: Order, include: [User] }
      ]
    }]
  });
  res.json(orders);
};

exports.getAllOrders = async (req, res) => {
  try {
    // Récupérer toutes les commandes avec les informations associées (produits, utilisateur, fournisseur)
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'fullName', 'email', 'phoneNumber', 'address'], // Détails de l'utilisateur (acheteur)
          required: false // Permet d'inclure les commandes sans utilisateur (commandes invitées)
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Produit,
              attributes: ['id', 'name', 'description', 'price'] // Détails du produit
            },
            {
              model: User,
              as: 'Fournisseur', // Détails du fournisseur (vendeur)
              attributes: ['id', 'fullName', 'email', 'phoneNumber'],
              required: false // Permet d'inclure les items sans fournisseur
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']] // Trier par date de création de la commande
    });

    if (!orders.length) {
      return res.status(404).json({ message: "Aucune commande trouvée.", orders: [] });
    }

    // Formater les données des commandes récupérées
    const formattedOrders = orders.map(order => {
      // Détails de l'acheteur (user)
      const buyer = order.User ? {
        id: order.User.id,
        name: order.User.fullName,
        email: order.User.email,
        phone: order.User.phoneNumber,
        address: order.User.address
      } : null;

      // Détails des produits commandés
      const items = order.items.map(item => {
        // Détails du fournisseur
        const supplier = item.Fournisseur ? {
          id: item.Fournisseur.id,
          name: item.Fournisseur.fullName,
          email: item.Fournisseur.email,
          phone: item.Fournisseur.phoneNumber
        } : null;

        return {
          id: item.id,
          product: {
            id: item.Produit.id,
            name: item.Produit.name,
            description: item.Produit.description,
            price: item.priceAtPurchase || item.Produit.price
          },
          quantity: item.quantity,
          status: item.status,
          supplier: supplier
        };
      });

      return {
        id: order.id,
        userId: order.userId,
        sessionId: order.sessionId,
        cartId: order.cartId,
        totalAmount: order.totalAmount,
        status: order.status,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        contactEmail: order.contactEmail,
        contactPhone: order.contactPhone,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        buyerName: order.buyerName,
        buyer: buyer,
        items: items
      };
    });

    return res.status(200).json({
      message: "Commandes récupérées avec succès",
      count: orders.length,
      orders: formattedOrders
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    await order.update({ status: req.body.status });
    return res.json({ 
      message: 'Statut mis à jour',
      order: order 
    });
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateItemStatusFournisseur = async (req, res) => {
  const item = await OrderItem.findOne({
    where: { 
      id: req.params.id,
      fournisseurId: req.user.id 
    }
  });
  if (!item) return res.status(403).json({ message: 'Non autorisé' });

  await item.update({ status: req.body.status });
  res.json(item);
};

exports.getUserOrders = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const orders = await Order.findAll({
      where: { userId: user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Produit,
              as: 'Produit',
              attributes: ['id', 'name', 'price', 'stock']
            },
            {
              model: User,
              as: 'Fournisseur', // Association vers User (fournisseur)
              attributes: ['fullName'] // On récupère le nom du fournisseur
            }
          ]
        }
      ]
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Aucune commande trouvée." });
    }

    return res.status(200).json({
      orders: orders.map(order => ({
        id: order.id,
        userId: order.userId,
        cartId: order.cartId,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        contactEmail: order.contactEmail,
        buyerName: order.buyerName,
        contactPhone: order.contactPhone,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        orderItems: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          fournisseurName: item.Fournisseur ? item.Fournisseur.fullName : 'Inconnu',
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
          status: item.status,
          product: {
            id: item.Produit.id,
            name: item.Produit.name,
            price: item.Produit.price,
            stock: item.Produit.stock
          }
        }))
      }))
    });

  } catch (error) {
    console.error("Erreur récupération commandes:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des commandes",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.cancelOrder = async (req, res) => {
  const orderId = req.params.id;

  try {
    // Charger la commande avec ses articles
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Produit,
            attributes: ['id', 'stock'],
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable." });
    }

    // Restocker chaque produit
    for (const item of order.items) {
      const produit = item.Produit;
      if (produit) {
        produit.stock += item.quantity;
        await produit.save();
      }
    }

    // Supprimer les articles liés
    await OrderItem.destroy({ where: { orderId } });

    // Supprimer la commande
    await order.destroy();

    return res.status(200).json({ message: "Commande annulée, produits restockés et supprimés." });

  } catch (error) {
    console.error("Erreur annulation commande:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'annulation.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.createGuestOrder = async (req, res) => {
  try {
    const { 
      buyerName, 
      contactPhone, 
      contactEmail = null, 
      shippingAddress, 
      paymentMethod, 
      billingAddress = shippingAddress, 
      cartId
    } = req.body;

    if (!buyerName || !contactPhone || !shippingAddress || !paymentMethod || !cartId) {
      return res.status(400).json({
        success: false,
        message: "Les champs buyerName, contactPhone, shippingAddress, paymentMethod et cartId sont obligatoires"
      });
    }

    const cart = await Cart.findOne({ 
      where: { 
        id: cartId,
        status: 'en cours' 
      },
      include: [{ model: CartItem, as: 'items', include: [{ model: Produit, attributes: ['id', 'stock', 'userId', 'name', 'price'] }] }] // Inclut les items du panier
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Panier vide ou introuvable"
      });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
     
      orderItemsData.push({
        productId: item.productId,
        fournisseurId: item.Produit.userId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtAddition || item.Produit.price,
        status: 'en attente'
      });

      totalAmount += (item.priceAtAddition || item.Produit.price) * item.quantity;
    }

    
    const order = await Order.create({
      cartId: cart.id,
      totalAmount,
      status: 'en attente', 
      shippingAddress,
      billingAddress,
      paymentMethod,
      contactEmail, 
      contactPhone,
      buyerName,
      userId: null 
    });

    const createdOrderItems = await OrderItem.bulkCreate(
      orderItemsData.map(item => ({
        ...item,
        orderId: order.id
      }))
    );

    await CartItem.destroy({ where: { cartId: cart.id } });

    return res.status(201).json({
      success: true,
      message: "Commande créée avec succès",
      orderId: order.id,
      order_items: createdOrderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        fournisseurId: item.fournisseurId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        status: item.status
      }))
    });

  } catch (error) {
    console.error("Erreur lors de la création de la commande invité:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de la commande",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
