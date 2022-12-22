const express = require('express');
const router = express.Router();

const { registerUser, loginUser, forgotPassword, resetPassword, logout } = require('../controllers/authController');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.route('/api/v1/register').post(registerUser);
router.route('/api/v1/login').post(loginUser);
router.route('/api/v1/password/forgot').post(forgotPassword);
router.route('/api/v1/password/reset/:token').put(resetPassword);
router.route('/api/v1/logout').get(isAuthenticatedUser, logout);


module.exports = router;