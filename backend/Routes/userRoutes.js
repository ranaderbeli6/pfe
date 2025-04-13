const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, verifyRole(['admin', 'superadmin']), userController.getAllUsers);

router.get('/role/:role', verifyToken, verifyRole(['admin', 'superadmin']), userController.getUsersByRole);

router.get('/user/:id', verifyToken, userController.getUserInfo);

router.put('/user/:id', verifyToken, verifyRole(['admin', 'superadmin']), userController.updateUser);

router.delete('/user/:id', verifyToken, verifyRole(['admin', 'superadmin']), userController.deleteUser);

router.delete('/users', verifyToken, verifyRole(['admin', 'superadmin']), userController.deleteMultipleUsers);



module.exports = router;
