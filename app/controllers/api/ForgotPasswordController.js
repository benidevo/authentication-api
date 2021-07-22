const { success, error, validation } = require('../../helpers/responseAPI');
const { randomString } = require('../../helpers/common');
const User = require('../../models/User');
const Verification = require('../../models/Verification');
const bcrypt = require('bcryptjs');

/*
    @desc       forgot password
    @method     POST api/password/forgot
    @access     Public
*/
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    // check email
    if (!email) {
        return res.status(422).json(validation([{ msg: 'Email is required' }]));
    };

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json(error('There is no registered account with this email address', res.statusCode));
        };
    
        let verification = await Verification.findOne({
            userID: user._id,
            type: 'Forgot Password'
        });

        // update verification

        if (verification) {
            verification = await Verification.findByIdAndRemove(verification._id);
        };

        // create new verification data 
        let newVerification = await Verification({
            token: randomString(50),
            userID: user._id,
            type: 'Forgot Password'
        });

        // save  verification data
        await newVerification.save();

        // send response
        res.status(200).json(success('Forgot password verification has been sent', {newVerification}, res.statusCode))
    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
};

/*
    @desc       reset user password
    @method     POST api/password/reset
    @access     Public
*/
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token) {
        return res.status(422).json(validation([{ msg: 'Token is required' }]));
    };

    if (!password) {
        return res.status(422).json(validation([{ msg: 'Password us required' }]));
    };

    try {
        let verification = await Verification.findOne({
            token,
            type: 'Forgot Password'
        });

        if (!verification) {
            return res.status(400).json(error('Invalid Token/Password data', res.statusCode));
        };

        // if verification data exists, find user
        let user = await User.findById(verification.userID);
        if (!user) {
            return res.status(404).json(error('User not found', res.statusCode));
        };

        // generate and hash Password
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);

        // update password
        user = await User.findByIdAndUpdate(user._id, {
            password: hashedPassword
        });

        // delete verification data
        verification = await Verification.findByIdAndRemove(verification._id);

        // send response
        res.status(200).json(success('Password updated', null, res.statusCode));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
};
