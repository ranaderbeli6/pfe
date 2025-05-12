const express = require('express');
const router = express.Router();
const statsController = require('../Controllers/statfournisseurController');
const {verifyToken} = require('../middlewares/authMiddleware');

router.get('/fournisseur/ventes', verifyToken, statsController.getVentesStats);
router.get('/fournisseur/avis', verifyToken, statsController.getAvisStats);
router.get('/fournisseur/produits', verifyToken, statsController.getProduitsStats);

router.get('/fournisseur/pdf', verifyToken, statsController.genererEtTelechargerPDFVentes);

module.exports = router;