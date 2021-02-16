const { Schema, model } = require('mongoose');

const sessionSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    token: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        required: true,
        expires: 60 * 60 * 24,
        default: Date.now()
    }
},{
    timestamps: true
})

module.exports = model('Sessions', sessionSchema)