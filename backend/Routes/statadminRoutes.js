const express = require('express');
const router = express.Router();
const statadmisController = require('../Controllers/statadmisController');

const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Middleware de sécurité : token obligatoire + rôle "admin"
const adminOnly = [verifyToken, verifyRole(['admin'])];

// Routes pour statistiques admin
router.get('/ventes-globales', statadmisController.getGlobalVentesStats);
router.get('/produits-global', statadmisController.getGlobalProduitsStats);
router.get('/top-produits', statadmisController.getProduitsLesPlusVendus);
router.get('/ca-fournisseurs', statadmisController.getChiffreAffaireParFournisseur);
router.get('/top-clients', statadmisController.getTopClients);
router.get('/ventes-mensuelles', statadmisController.getVentesMensuelles);
router.get('/export/excel',statadmisController.exportGlobalVentesStatsToExcel);
module.exports = router;
