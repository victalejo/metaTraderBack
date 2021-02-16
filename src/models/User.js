const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: Number,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String,
        required: false,
        default: 'default.jpg',
        trim: true
    },
    clientId: {
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    passMT5: {
        type: String,
        required: true,
        trim: true
    },
    idAccountMTC: {
        type: String,
        reqiured: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    active: {
        type: Boolean,
        required: true,
        default: false,
        trim: true
    },
    activeTime: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Cliente'],
        default: 'Cliente',
        trim: true
    }
},{
    timestamps: true
})

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        try {
            this.password = await bcrypt.hash(this.password, 10)
            next()
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    next()
})

userSchema.methods.comparePassword = async function(password){
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        return console.log(error);
    }
}

// Funcion para validar si la suscripcion ha finalizado
// userSchema.methods.isActive = function(){
//     let active = new Date(this.activeTime)
//     let fechaA = new Date()

    // if(fechaA.getMonth() === 11){
    //     if(fechaA.getMonth() > active.getMonth()){
    //         return { active: false, time: null }
    //     }else{
    //         if(active.getMonth() >= fechaA.getMonth() && active.getDate() >= fechaA.getDate()){
    //             return { active: false, time: null }
    //         }
    //     }
    // }else{
    // if(fechaA.getMonth() > active.getMonth()){
    //     return { active: false, time: null }
    // }else{
    //     if(active.getMonth() <= fechaA.getMonth() && active.getDate() >= fechaA.getDate()){
    //         return { active: false, time: null }
    //     }
    // }
    // }

//     return false
// }

module.exports = model('Users', userSchema)