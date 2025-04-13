const express = require('express');
const router = express.Router();
const { getCart,getOrCreateCart, addToCart, removeFromCart, updateCartItemQuantity, clearCart } = require('../Controllers/CartController');
const { optionalToken } = require('../middlewares/authMiddleware');

router.get('/', optionalToken, getCart);  
router.post('/add', optionalToken, addToCart); 
router.delete('/items/:cartItemId', optionalToken, removeFromCart); 
router.put('/items/:cartItemId', optionalToken, updateCartItemQuantity);
router.delete('/clear', optionalToken, clearCart); 



module.exports = router;
