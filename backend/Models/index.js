require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    logging: false,
  }
);

// Imports
const User = require('./User');
const Produit = require('./Produit');
const Service = require('./Service'); 
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const Avis = require('./Avis');
const OrderItem = require('./OrderItem');
// Associations

User.hasMany(Produit, { foreignKey: 'userId' });
Produit.belongsTo(User, { foreignKey: 'userId' });

// Service et User
User.hasMany(Service, { foreignKey: 'userId' });
Service.belongsTo(User, { foreignKey: 'userId' });

// Cart et User
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// Cart et CartItem
Cart.hasMany(CartItem, { 
  foreignKey: 'cartId',
  onDelete: 'CASCADE',
  as: 'items'
});
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

Produit.hasMany(CartItem, { 
  foreignKey: 'productId',
  onDelete: 'CASCADE'
});
CartItem.belongsTo(Produit, { foreignKey: 'productId' });

// Order et User
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order et Cart
Cart.hasOne(Order, { foreignKey: 'cartId' });
Order.belongsTo(Cart, { foreignKey: 'cartId' });


Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE'
});
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Produit <--> OrderItem
Produit.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Produit, { foreignKey: 'productId' });

// User (fournisseur) <--> OrderItem
User.hasMany(OrderItem, { foreignKey: 'fournisseurId', as: 'FournisseurItems' });
OrderItem.belongsTo(User, { foreignKey: 'fournisseurId', as: 'Fournisseur' });


User.hasMany(Avis, { foreignKey: 'userId', as: 'avis' });
Avis.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Produit.hasMany(Avis, { foreignKey: 'produitId', as: 'avis' });
Avis.belongsTo(Produit, { foreignKey: 'produitId', as: 'produit' });

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base établie');
    
    await sequelize.sync({ force: false });
    console.log('✅ Modèles synchronisés');
  } catch (error) {
    console.error('❌ Erreur de base de données:', error);
  }
})();



module.exports = {
  sequelize,
  User,
  Produit,
  Service, 
  Cart,
  CartItem,
  Order,
  OrderItem, 
  Avis
};
