const User = require('../models/User');
const { sendEmail } = require('./sendEmails');
// const { addUserToCopySlave, removeStrategyToCopy } = require('./apiMT');

// Función para activar usuarios en la app
// Solo para administradores
exports.activatedUser = async (req, res) =>{
    try {
        let { email } = req.body

        if(!email){
            return res.status(401).json({
                ok: false,
                message: 'Debe mandar un usuario a activar'
            })
        }

        if(!/^[\w-ñÑÀ-ÿ!"#$%&|=¿<>()\/@.;,:_?'{}^+*[\]`~]{4,30}@[\w]{2,15}\.[\w]{2,15}$/g.test(email)) return res.status(401).json({
            ok: false,
            message: 'Correo inválido'
        })
    
        // Buscar un usuario para analizar si existe en la base de datos
        let user = await User.findOne({ email })
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(!user){
            return res.status(404).json({
                ok: false,
                message: 'El usuario no existe'
            })
        }

        // addUserToCopySlave(user.email)
            // .then( async rpt =>{
                // Actualizacion del dato activo del usuario en la base de datos
                let newUser = await User.findOneAndUpdate({ _id: user._id, email: user.email }, { active: true, activeTime: `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`}, { new: true })
                    .catch(err =>{
                        console.log(err);
                        return res.status(500).json({
                            ok: false,
                            message: 'Error inesperado al activar el usuario'
                        })
                    })

                // información que se enviará por correo indicando que el usuario se ha desactivado
                let titulo = "Usuario activado";
                let subject = "Cuenta activada";
                let messagePrimaryUser = `${newUser.name} ${newUser.lastName} Han activado su cuenta en greatStyleFx, ya puedes disfrutar de la app en su totalidad`;
                let messageSecondaryUser = "Si no está registrado en nuestra app, o si tienes problemas, envianos un correo";
                let messagePrimary = `El usuario ${email} ha sido activado`;
                let messageSecondary = `Has activado éste usuario el día ${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()} a las ${new Date().getHours()}:${new Date().getMinutes()}`;

                await sendEmail(email, titulo, subject, messagePrimaryUser, messageSecondaryUser, messagePrimary, messageSecondary)
                    .catch(err =>{
                        console.log(err)
                        return res.status(500).json({
                            ok: false,
                            messga: err
                        })
                    })

                return res.status(200).json({
                    ok: true,
                    message: `El usuario ${newUser.name} ${newUser.lastName} ha sido activado`
                })
            // })
            // .catch(err =>{
            //     console.log(err);
            //     return res.status(500).json({
            //         ok: false,
            //         message: 'No se pudo activar el usuario, intentalo otra vez en unos minutos'
            //     })
            // })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}

// Función para desactivar usuarios en la API
// Solo para administradores
exports.deactivateUser = async (req, res) =>{
    try {
        let { email } = req.body

        if(!email){
            return res.status(401).json({
                ok: false,
                message: 'Debe mandar un usuario a desactivar'
            })
        }

        if(!/^[\w-ñÑÀ-ÿ!"#$%&|=¿<>()\/@.;,:_?'{}^+*[\]`~]{4,30}@[\w]{2,15}\.[\w]{2,15}$/g.test(email)) return res.status(401).json({
            ok: false,
            message: 'Correo inválido'
        })
        
        // Buscar un usuario para analizar si existe en la base de datos
        let user = await User.findOne({ email })
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(!user){
            return res.status(404).json({
                ok: false,
                message: 'El usuario no existe'
            })
        }

        // removeStrategyToCopy()
            // .then( async rpt =>{
                // Actualizacion del dato activo del usuario en la base de datos
                await User.findOneAndUpdate({ _id: user._id, email: user.email }, { active: false, activeTime: null },  { new: true })
                    .catch(err =>{
                        console.log(err);
                        return res.status(500).json({
                            ok: false,
                            message: 'Error inesperado'
                        })
                    })

                // información que se enviará por correo indicando que el usuario se ha desactivado
                let titulo = "Usuario desactivado";
                let subject = "Cuenta desactivada";
                let messagePrimaryUser = `${user.name} ${user.lastName} su membresía ha finalizado, por lo tanto su cuenta de greatStyleFx ha sido desactivada`;
                let messageSecondaryUser = "Su cuenta será activada cuando realice el pago de la siguiente membresía";
                let messagePrimary = `El usuario ${email} ha sido desactivado`;
                let messageSecondary = `Has desactivado éste usuario el día ${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()} a las ${new Date().getHours()}:${new Date().getMinutes()}`;

                await sendEmail(email, titulo, subject, messagePrimaryUser, messageSecondaryUser, messagePrimary, messageSecondary)
                    .catch(err =>{
                        console.log(err)
                        return res.status(500).json({
                            ok: false,
                            message: err
                        })
                    })

                return res.status(200).json({
                    ok: true,
                    message: `El usuario ${user.name} ${user.lastName} ha sido desactivado`
                })
            // })
            // .catch(err =>{
            //     console.log(err)
            //     return res.status(500).json({
            //         ok: false,
            //         message: 'Ocurrió un error inesperado al desactivar el usuario'
            //     })
            // })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}

// activa los usuarios cuando se realice la compra
// la activación pueden set Aceptada, rechazada, o Pendiente
exports.activateUserCurrent = (user, state) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            if(!user) return reject('No se encontró el usuario a activar')
            if(!state) return reject('No hay estado de la respuesta')
    
            // addUserToCopySlave(user.email)
                // .then( async rpt =>{
                    // Si la compra es pendiente avisar enviando correos y dejar el activeTime como Pendiente
                    if(state === 'Pendiente'){
                        // deja el usuario pendiente en la DB para activarlo manualmente cuando se confirme el pago
                        let userUpdated = await User.findOneAndUpdate({ _id: user._id, email: user.email }, { active: false, activeTime: 'Pendiente' }, { new: true })
                            .catch(err =>{
                                console.log(err);
                                return reject('Error inesperado al actualizar el usuario')
                            })
                        
                        if(!userUpdated) return reject('No se pudo actualizar el usuario')
                        
                        return resolve('Usuario en estado pendiente')
                    }
                    
                    // Activa el usuario
                    // El activeTime es la fecha cuando se activó el usuario
                    let newUser = await User.findOneAndUpdate({ _id: user._id, email: user.email }, { active: true, activeTime: `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`}, { new: true })
                        .catch(err =>{
                            console.log(err);
                            return reject('Error inesperado al activar el usuario')
                        })

                    if(!newUser) return reject('No se pudo activar el usuario')
                    
                    let messageActiveUser = {
                        message: `El usuario ${newUser.name} ${newUser.lastName} ha sido activado`,
                        newUser
                    }

                    return resolve(messageActiveUser)
                // })
                // .catch(err =>{
                //     console.log(err);
                //     return res.status(500).json({
                //         ok: false,
                //         message: 'No se pudo activar el usuario, intentalo otra vez en unos minutos'
                //     })
                // })
        } catch (error) {
            console.log(error);
            return reject('Error inesperado')
        }
    })
}