const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

exports.createdToken = (payload) =>{
    return new Promise((resolve, reject) =>{
        try {
            if(!payload) return reject('No autorizado')

            let id = payload.id.toString()

            const token = jwt.sign({ id, name: payload.name, lastName: payload.lastName, email: payload.email, activo: payload.activo.toString() }, process.env.JWTSECRET, { expiresIn: 60 * 60 * 24 })

            Session.create({
                email: payload.email,
                token
            })
                .then(session =>{
                    if(!session){
                        return reject('No autorizado')
                    }else{
                        return resolve(token)
                    }
                })
                .catch(err =>{
                    console.log('ERROR', err);
                    return reject('No autorizado')
                })
        } catch (error) {
            console.log(error);
            return reject('Error inesperado')
        }
    })
}

exports.verifyToken = (token) =>{
    return new Promise((resolve, reject) =>{
        try {
            if(!token) return reject('No autorizado')

            jwt.verify(token, process.env.JWTSECRET, function(err, decoded){
                if(err) return reject('Token expirado')

                Session.findOne({ email: decoded.email })
                    .then(session =>{
                        if(!session){
                            return reject('No autorizado')
                        }else{
                            return resolve(session)
                        }
                    })
                    .catch(err =>{
                        console.log(err);
                        return reject('No autorizado')
                    })
            })
        } catch (error) {
            console.log(error);
            return reject('Error inesperado')
        }
    })
}

exports.updateToken = (payload) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!payload) return reject('No autorizado, datos erróneos')

            let id = payload.id.toString()
            
            const token = jwt.sign({ id, name: payload.name, lastName: payload.lastName, email: payload.email, activo: payload.activo.toString() }, process.env.JWTSECRET, { expiresIn: 60 * 60 * 24 })

            let session = await Session.updateOne({ email: payload.email }, { token })
                .catch(err =>{
                    console.log(err)
                    return reject('Error inesperado actualizando el usuario')
                })

            if(!session){
                return reject('No autorizado')
            }

            return resolve(token)
        } catch (error) {
            console.log(error)
            return reject('Error inesperado')
        }
    })
}