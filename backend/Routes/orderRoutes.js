const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, orderController.createOrder);
router.get('/userorders', verifyToken, orderController.getUserOrders);

router.get('/all', verifyToken, orderController.getAllOrders);
router.put('/:id/status', verifyToken, orderController.updateOrderStatus);

router.get('/fournisseur', verifyToken, verifyRole(['fournisseur']), orderController.getFournisseurOrders);
router.patch('/fournisseur/items/:id', verifyToken, verifyRole(['fournisseur']), orderController.updateItemStatusFournisseur);

router.post('/guest', orderController.createGuestOrder);

router.delete('/:id', verifyToken, orderController.cancelOrder);

module.exports = router;