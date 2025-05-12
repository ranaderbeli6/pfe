const express = require('express');
const router = express.Router();
const promotionController = require('../Controllers/promotionController');
const {verifyToken,verifyRole} = require('../middlewares/authMiddleware');

router.post('/add', verifyToken, promotionController.createPromotion);

router.delete('/cancel',verifyToken, promotionController.cancelPromotion);
router.get('/getall',verifyToken, promotionController.getAllPromotions);


module.exports = router;
