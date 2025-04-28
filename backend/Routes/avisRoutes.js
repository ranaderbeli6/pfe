const express = require('express');
const router = express.Router();
const avisController = require('../Controllers/avisController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, avisController.createAvis);

router.get('/:produitId', avisController.getAvisByProduit);
router.put('/:id',verifyToken, avisController.updateAvis);
router.delete('/:id',verifyToken, avisController.deleteAvis);

module.exports = router;
