const { check } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config')
const { error } = require('../helpers/responseAPI'); 

exports.registerValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
];

exports.loginValidation = [
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty()
]

/*
    get authenticated user via jwt
*/
exports.auth = async (req, res, next) => {
    const authorizationHeader = req.header('Authorization');
    // convert authorization header to array
    const authorizationHeaderArray = authorizationHeader.split(' ');

    // get token
    const bearer = authorizationHeaderArray[0];
    const token = authorizationHeaderArray[1];

    //  check token type
    if (bearer !== 'Bearer') {
        return res.status(400).json(error('Type of token must be Bearer', res.statusCode));
    };

    // check token
    if (!token) {
        return res.status(401).json(error('No token found', res.statusCode));
    };

    try {
        const jwtData = await jwt.verify(token, config.get('jwtSecret'));

        if (!jwtData) {
            return res.status(401).json(error('Unauthorized', res.statusCode));
        };

        // set user object to authorized user
        req.user = jwtData.user;

        // continue to the next section
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
};
