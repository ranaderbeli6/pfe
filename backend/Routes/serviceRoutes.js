const express = require('express');
const router = express.Router();
const serviceController = require('../Controllers/serviceController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.get('/fournisseur/services', verifyToken, verifyRole(['fournisseur']), serviceController.getServicesFournisseur);
router.post('/add', verifyToken, verifyRole(['fournisseur']), upload.single('image'), serviceController.addService);
router.put('/:id', verifyToken, verifyRole(['fournisseur']), upload.single('image'), serviceController.updateService);
router.delete('/:id', verifyToken, verifyRole(['fournisseur']), serviceController.deleteService);
router.delete('/delete-multiple', verifyToken, verifyRole(['admin', 'superadmin','fournisseur']), serviceController.deleteMultipleServices);

module.exports = router;
