const { success, error, validation } = require('../../helpers/responseAPI');
const { randomString } = require('../../helpers/common');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Verification = require('../../models/Verification');

/* 
    @desc       Register a new user
    @method     POST
    @access     Public
*/
exports.register = async (req, res) => {
    // validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json(validation(errors.array()));
    };

    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            return res.status(422).json(validation({ msg: "Email already exists!" }));;
        };

        let newUser = new User({
            name,
            email: email.toLowerCase().replace(/\s+/, ""),
            password,
        });

        // hash password
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        // save user
        await newUser.save();

        // Generate and save token
        let verification = new Verification({
            token: randomString(50),
            userID: newUser._id,
            type: 'Register New Account'
        });

        // save token data
        await verification.save();

        // send response
        res.status(201).json(success(
            'Registration successful. Please activate your account',
            {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    isVerified: newUser.isVerified,
                    verifiedAt: newUser.verifiedAt,
                    createdAt: newUser.createdAt
                },
                verification,
            },
            res.statusCode
        ));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('server error', res.statusCode));
    }
};

/*
    @desc       verify new user
    @method     GET api/auth/verify/:token
    @access     Public
*/
exports.verify = async (req, res) => {
    const { token } = req.params;

    try {
        let verification = await Verification.findOne({
            token,
            type: 'Register New Account'
        });

        if (!verification) {
            return res.status(404).json(error('No verification data found', res.statusCode));
        };

        let user = await User.findOne({ _id: verification.userID }).select('-password');
        user = await User.findByIdAndUpdate(user._id, {
            $set: {
                isVerified: true,
                verifiedAt: new Date()
            }
        });

        // after verifying user, remove verification data from db
        verification = await Verification.findByIdAndRemove(verification._id);

        // send response
        res.status(200).json(success(
            'verification successful',
            null,
            res.statusCode
        ));
    } catch (err) {
        console.error(err);
        res.status(500).json(error('Server error', res.statusCode));
    }
};
