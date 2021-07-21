const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    token: {
        type: String,
        maxlength: 255
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true,
        maxlength: 255
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.Schema('Verification', verificationSchema);
