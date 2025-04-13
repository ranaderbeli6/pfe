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

const User = require('./User');
const Produit = require('./Produit');
const Service = require('./Service'); 
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');


User.hasMany(Produit, { foreignKey: 'userId' });
Produit.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Service, { foreignKey: 'userId' });
Service.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });
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
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Cart.hasOne(Order, { foreignKey: 'cartId' });
Order.belongsTo(Cart, { foreignKey: 'cartId' });




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
  Order
};