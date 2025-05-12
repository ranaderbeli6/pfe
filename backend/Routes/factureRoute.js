const express = require('express');
const router = express.Router();
const factureController = require('../Controllers/factureController');
const {verifyToken} = require('../middlewares/authMiddleware');

router.post('/:orderId',verifyToken, factureController.creerFactureSimple);

router.get('/:factureId/telecharger',verifyToken, factureController.telechargerFacture);

router.get('/factures', verifyToken, factureController.listerFactures);

module.exports = router;