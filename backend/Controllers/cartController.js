require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require("../Models/User");
const nodemailer = require('nodemailer');
const Cart = require('../Models/Cart');
const CartItem = require('../Models/CartItem');
const Produit = require('../Models/Produit');
const { Sequelize } = require('sequelize');

const CART_STATUS = {
  ACTIVE: 'en cours', 
  VALID: 'validé',     
  CANCELLED: 'annulé'  
};

const getOrCreateCart = async (req) => {
  if (req.user?.id) {
    const [cart] = await Cart.findOrCreate({
      where: { userId: req.user.id, status: 'en cours' }
    });
    return cart;
  }

  if (!req.session.cartId) {
    const newCart = await Cart.create({ status: 'en cours' });
    req.session.cartId = newCart.id;
    return newCart;
  }

  return Cart.findByPk(req.session.cartId);
};

const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    const cartWithItems = await Cart.findOne({
      where: { id: cart.id },
      include: [{
        model: CartItem,
        as: 'items', 
        include: [Produit]
      }]
    });
    

    return res.status(200).json({
      success: true,
      data: cartWithItems
    });

  } catch (err) {
    console.error('Get Cart Error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération du panier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'productId et quantity sont obligatoires'
    });
  }

  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({
      success: false,
      message: 'La quantité doit être un entier positif'
    });
  }

  try {
    const cart = await getOrCreateCart(req);

    const product = await Produit.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuffisant pour ce produit'
      });
    }

    product.stock -= quantity;
    await product.save();

    const cartItem = await CartItem.create({
      cartId: cart.id,
      productId: product.id,
      quantity: quantity,
      priceAtAddition: product.price,
      itemType: 'produit'
    });

    res.status(200).json({
      success: true,
      message: 'Produit ajouté au panier',
      data: cartItem
    });

  } catch (err) {
    console.error('Add to Cart Error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout au panier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const removeFromCart = async (req, res) => {
  const { cartItemId } = req.params;

  try {
    const cartItem = await CartItem.findByPk(cartItemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé dans le panier'
      });
    }

    const cart = await getOrCreateCart(req);
    if (cartItem.cartId !== cart.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cet article'
      });
    }

    const product = await Produit.findByPk(cartItem.productId);
    if (product) {
      product.stock += cartItem.quantity;
      await product.save();
    }

    await cartItem.destroy();
    res.status(200).json({
      success: true,
      message: 'Article supprimé du panier'
    });

  } catch (err) {
    console.error('Remove from Cart Error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'article',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const updateCartItemQuantity = async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({
      success: false,
      message: 'La quantité doit être un entier positif'
    });
  }

  try {
    const cartItem = await CartItem.findByPk(cartItemId, {
      include: [Produit]
    });
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé dans le panier'
      });
    }

    const cart = await getOrCreateCart(req);
    if (cartItem.cartId !== cart.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cet article'
      });
    }

    const quantityDifference = quantity - cartItem.quantity;

    if (quantityDifference > 0) {
      if (quantityDifference > cartItem.Produit.stock) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant. Il y a seulement ${cartItem.Produit.stock} unités disponibles.`
        });
      }
    }

    cartItem.Produit.stock -= quantityDifference;
    await cartItem.Produit.save();

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      success: true,
      data: cartItem
    });
  } catch (err) {
    console.error('Update Cart Item Error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la quantité',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });

    for (const cartItem of cartItems) {
      const product = await Produit.findByPk(cartItem.productId);
      if (product) {
        product.stock += cartItem.quantity;
        await product.save();
      }
    }

    await CartItem.destroy({ where: { cartId: cart.id } });

    res.status(200).json({
      success: true,
      message: 'Panier vidé et stock mis à jour avec succès'
    });
  } catch (err) {
    console.error('Clear Cart Error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du vidage du panier et de la mise à jour du stock',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = { 
  getOrCreateCart,
  getCart, 
  addToCart, 
  removeFromCart, 
  updateCartItemQuantity, 
  clearCart 
};
