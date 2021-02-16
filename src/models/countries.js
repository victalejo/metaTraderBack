const { Schema, model } = require('mongoose')

const countriesSchema = new Schema({
    country: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
})

module.exports = model('countries', countriesSchema)