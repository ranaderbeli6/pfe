const express = require('express');
const router = express.Router();
const sendMessage = require('../Controllers/sendMessage'); 

router.post('/send', sendMessage);

module.exports = router;
