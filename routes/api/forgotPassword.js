const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword } = require('../../app/controllers/api/ForgotPasswordController');


// forgot password route
router.post('/forgot', forgotPassword);

//  reset password route
router.post('/reset', resetPassword);

module.exports = router;
