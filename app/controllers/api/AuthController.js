const { success, error, validation } = require('../../helpers/responseAPI');
const { randomString } = require('../../helpers/common');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Verification = require('../../models/Verification');
const config = require('config');

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
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
};

/* 
    @desc       login user
    @method     POST api/auth/login
    @access     Public
*/
exports.login = async (req, res) => {
    // validation
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(validation(errors.array()))
    };

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        
        // check if user exist
        if (!user) {
            return res.status(404).json(error('There is no registered account with this email address.', res.statusCode))
        };

        // check if password is valid
        let checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(404).json(error('Invalid password', res.statusCode));
        };

        // check if user account is verified
        if (user && !user.isVerified) {
            return res.status(400).json(error('Inactive account', res.statusCode));
        };

        const payload = {
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        };

        // login user
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 36000 },
            (err, token) => {
                if (err) throw err;
                
                res.status(200).json(success('Successfully logged in', { token }, res.statusCode))
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
};


/*
    @desc       resend verification token
    @method     POST api/auth/verify/resend
    @access     Public
*/
exports.resendToken = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(422).json(validation({ msg: 'Email is required' }));
    };

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json(error('There is no registered user with this email address', res.statusCode));
        };

        // if user exists
        if (user) {
            let verification = await Verification.findOne({
                userID: user._id,
                type: 'Register New Account'
            });

            // remove previous verification data
            if (verification) {
               verification = await Verification.findByIdAndRemove(verification._id);
            };

            // create new verification data
            let newVerification = await Verification({
                token: randomString(50),
                userID: user._id,
                type: 'Register New Account'
            });

            // save new verification data
            await newVerification.save();

            //  send response 
            res.status(200).json(success(
                'Token resend successful',
                { verification: newVerification },
                res.statusCode
            ));
        };
    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
};

/*
    @desc       get an authenticated user
    @method     GET api/auth/
    @access     Private
*/
exports.getAuthenticatedUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)

        // check user
        if (!user) {
            return res.status(404).json(error('User not found', res.statusCode));
        };

        // send response
        res.status(200).json(success(`Hello ${user.name}`, { user }, res.statusCode));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
};
