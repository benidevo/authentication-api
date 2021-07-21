const express = require('express');
const router = express.Router();
const { register } = require('../../app/controllers/api/AuthController');
const { registerValidation } = require('../../app/middlewares/auth');

router.post('/register', registerValidation, register);

module.exports = router;
