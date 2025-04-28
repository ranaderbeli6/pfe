const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const { register, login, getUserInfo, sendPasswordResetEmail, resetPassword ,logout,inviteAdmin,updateUser,getMyAccount,updateMyAccount} = require('../Controllers/authController');

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getUserInfo);
router.post('/forgot-password', sendPasswordResetEmail);
router.post('/reset-password', resetPassword);
router.post('/logout',logout);
router.post("/invite-admin", inviteAdmin);
router.put('/user/:id', updateUser);
router.get('/user/info',verifyToken, getMyAccount);
router.put('/info',verifyToken, updateMyAccount);


module.exports = router;
