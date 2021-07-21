const express = require('express');
const router = express.Router();
const { register, verify } = require('../../app/controllers/api/AuthController');
const { registerValidation } = require('../../app/middlewares/auth');

//  register user
router.post('/register', registerValidation, register);

// verify new user
router.get('/verify/:token', verify)

module.exports = router;
