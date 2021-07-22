const express = require('express');
const router = express.Router();
const { register, verify, login, resendToken, getAuthenticatedUser } = require('../../app/controllers/api/AuthController');
const { registerValidation, loginValidation, auth } = require('../../app/middlewares/auth');

//  register user
router.post('/register', registerValidation, register);

// verify new user
router.get('/verify/:token', verify);

// login user
router.post('/login', loginValidation, login);

// resend token
router.post('/verify/resend', resendToken);

// get authenticated user
router.get('/', auth, getAuthenticatedUser)

module.exports = router;
