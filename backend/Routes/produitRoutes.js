const express = require('express');
const router = express.Router();
const produitController = require('../Controllers/produitController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.get('/produits/en-attente', verifyToken, verifyRole(['admin', 'superadmin']), produitController.getProduitsEnAttente);
router.get('/produits', produitController.getProduits);
router.get('/produits/:id', produitController.getProductById);
router.delete('/produits/delete-multiple', verifyToken, verifyRole(['admin', 'superadmin', 'fournisseur']), produitController.deleteMultipleProduits);
router.get('/fournisseur', verifyToken, produitController.getProduitsFournisseur);
router.post('/add', verifyToken, verifyRole(['admin', 'superadmin', 'fournisseur']), upload.single('image'), produitController.addProduit);
router.put('/produits/:id', verifyToken, verifyRole(['admin', 'superadmin', 'fournisseur']), produitController.updateProduit);
router.delete('/produits/:id', verifyToken, verifyRole(['admin', 'superadmin', 'fournisseur']), produitController.deleteProduit);
router.put('/produits/accepter/:id', verifyToken, verifyRole(['admin', 'superadmin']), produitController.accepterProduit);
router.put('/produits/refuser/:id', verifyToken, verifyRole(['admin', 'superadmin']), produitController.refuserProduit);

module.exports = router;
