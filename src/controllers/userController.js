const User = require('../models/User');
const Country = require('../models/countries')
const { createdToken } = require('../jwt/jwt');
const Session = require('../models/Session');
// const { añadirUsuario, addUserToCopyAdmin } = require('./apiMT');

// Función para registrar usuarios
exports.userRegister = async (req, res) =>{
    try {
        if(req.session.user){
            return res.status(403).json({
                ok: false,
                message: 'ya inició sesión'
            })
        }

        let { name, lastName, phone, country, clientId, passMT5, email, password, confirmPassword } = req.body
        // comprobar si todos los datos llegaron en el cuerpo de la petición
        if(!name || !lastName || !phone || !country || !clientId || !passMT5 || !email || !password || !confirmPassword){
            return res.status(401).json({
                ok: false,
                message: 'Todos los campos son requeridos'
            })
        }else{
            // limipiar los espacios en blanco a los lados de los datos
            name.trim(), lastName.trim(), country.trim(), passMT5.trim(), email.trim(), password.trim(), confirmPassword.trim()
        }
    
        // Validar las entradas
        let nameValid = /^([\w-!#_:;.,]{3,100}\s?)([\w-!#_:;.,]{3,100})?$/g.test(name)
        if(!nameValid){
            return res.status(401).json({
                ok: false,
                message: 'El nombre es inválido'
            })
        }
    
        let lastNameValid = /^([\w-!#_:;.,]{3,100}\s?)([\w-!#_:;.,]{3,100})?$/g.test(lastName)
        if(!lastNameValid){
            return res.status(401).json({
                ok: false,
                message: 'El apellido es inválido'
            })
        }
    
        let phoneValid = /^[0-9]{9,12}$/g.test(phone)
        if(!phoneValid){
            return res.status(401).json({
                ok: false,
                message: 'El número de teléfono es inválido'
            })
        }

        let countryValid = /^([a-zA-ZñÑúáé]{4,80}\s?)([a-zA-Z]{3,60})?$/.test(country)
        if(!countryValid){
            return res.status(401).json({
                ok: false,
                message: 'El país es inválido'
            })
        }

        // pasar todo el pais entrante a minúscula
        country = country.toLowerCase()
        // pasar todas las primeras letras de las palabras de los paises a mayuscula (capitalización)
        country = country.replace(/\w\S*/g, w => w.replace(/^\w/, w => w.toUpperCase()))

        // Verificar si el pais existe en la base de datos
        let countryExists = await Country.findOne({country})
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })
        
        if(!countryExists){
            return res.status(404).json({
                ok: false,
                message: 'El país no existe'
            })
        }

        // verificar las entradas
        let clientIdValid = /^[0-9]{5,50}$/g.test(clientId)
        if(!clientIdValid){
            return res.status(400).json({
                ok: false,
                message: 'El id del cliente es inválido'
            })
        }

        let passMT5Valid = /^[\w-!"#$%&/()='?¨*´+{}_:.;,]{6,50}$/g.test(passMT5)
        if(!passMT5Valid){
            return res.status(400).json({
                ok: false,
                message: 'La contraseña de Meta Trader es inválida'
            })
        }
    
        let emailValid = /^[\w-!"#$%&()'?´`+=*_:.;,^<>[\]{}]{4,80}@[\w-]{3,20}\.[\w-]{2,15}$/g.test(email)
        if(!emailValid){
            return res.status(401).json({
                ok: false,
                message: 'El correo electrónico es inválido'
            })
        }
    
        // verificar que la contraseña no tenga menos de 6 caracteres
        if(password.length < 6 || confirmPassword.length < 6){
            return res.status(401).json({
                ok: false,
                message: 'La contraseña debe tener al menos 6 caractéres'
            })
        }

        let passwordValid = /^[\w-!"#$%&/()='?¨*´+{}_:.;,]{6,50}$/g.test(password)
        if(!passwordValid){
            return res.status(401).json({
                ok: false,
                message: 'La contraseña es inválida'
            })
        }
    
        // verificar que las contraseñas sean iguales
        if(password != confirmPassword){
            return res.status(401).json({
                ok: false,
                message: 'Las contraseñas deben ser iguales'
            })
        }
    
        let userFound = await User.findOne({email})
            .catch(err =>{
                console.log(err);
                return res.status(500).json({ ok: false, message: 'Error inesperado' })
            })
        
        // verificar si el usuario ya existe en la base de datos
        if(userFound){
            return res.status(400).json({
                ok: false,
                message: 'El usuario ya existe'
            })
        }

        let clientIdExist = await User.findOne({ clientId })
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(clientIdExist){
            return res.status(401).json({
                ok: false,
                message: 'El id del cliente ya existe'
            })
        }
    
        // crear el usuario en la base de datos
        let userCreate = await User.create({
            name,
            lastName,
            phone,
            country,
            clientId,
            passMT5,
            email,
            password
        })
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        // crear el usuario vinculado con meta trader
        // añadirUsuario(email, clientId, passMT5)
            // .then(rpt =>{
        let payload = {
            id: userCreate._id,
            name: name,
            lastName: lastName,
            email: email,
            activo: userCreate.active
        }

        // funcion para crear el token de jwt
        createdToken(payload)
            .then(async token =>{
                // sesion del usuario
                req.session.user = {
                    id: userCreate._id,
                    name: name,
                    lastName: lastName,
                    email: email
                }
                
                // devolver la respuesta exitosa al usuario
                return res.status(201).json({
                    ok: true,
                    message: 'Registro exitoso',
                    token
                })
            })
            .catch(err =>{
                console.log(err);
                return res.status(403).json({
                    ok: false,
                    message: 'Error al registrar el usuario'
                })
            })
            // })
            // .catch(err =>{
            //     console.log(err);
            //     return res.status(201).json({
            //         ok: true,
            //         message: 'Se ha creado el usuario en la app pero no se pudo crear el usuario vinculado con meta trader'
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

// funcion para iniciar sesion al usuario
exports.userLogin = async (req, res) =>{
    try {
        let { email, password } = req.body
    
        // comprobar que todos los datos esten presentes
        if(!email, !password){
            return res.status(401).json({
                ok: false,
                message: 'Todos los campos son requeridos'
            })
        }
    
        // validar entradas
        let emailValid = /^[\w-ñÑÀ-ÿ!"#$%&|=¿<>()\/@.;,:_?'{}^+*[\]`~]{4,30}@[\w]{2,15}\.[\w]{2,15}$/g.test(email)
        if(!emailValid){
            return res.status(401).json({
                ok: false,
                message: 'El correo electrónico es inválido'
            })
        }
    
        let passValid = /^[\w-!"#$%&/()='?¨*´+{}_:.;,]{6,}$/g.test(password)
        if(!passValid){
            return res.status(401).json({
                ok: false,
                message: 'La contraseña es inválida'
            })
        }

        if(req.session.user){
            return res.status(401).json({
                ok: false,
                message: 'Ya ha iniciado sesión'
            })
        }
    
        // buscar usuario en la base de datos (DB)
        let userFound = await User.findOne({email})
            .catch(err => {
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            });
    
        if(!userFound){
            return res.status(404).json({
                ok: false,
                message: 'El usuario no existe'
            })
        }else{
            // comparar la contraseña recibida por el usuario con la contraseña encriptada
            let passFound = await userFound.comparePassword(password)
                .catch(err => {
                    console.log(err)
                    return res.status(500).json({
                        ok: false,
                        message: 'Error inesperado'
                    })
                });
            if(!passFound){
                return res.status(404).json({
                    ok: false,
                    message: 'La contraseña es incorrecta'
                })
            }else{
                // payload para la sesion y el jwt
                let payload = {
                    id: userFound._id,
                    name: userFound.name,
                    lastName: userFound.lastName,
                    email: userFound.email,
                    activo: userFound.active
                }

                // funcion para crear el token de jwt
                createdToken(payload)
                    .then(async token =>{
                        // sesion del usuario
                        req.session.user = {
                            name: userFound.name,
                            lastName: userFound.lastName,
                            email: userFound.email
                        }

                        // if(userFound.role != 'Admin'){
                        //     let active = userFound.isActive()
                        //     if(typeof active === 'object'){
                        //         await User.updateOne({ email: userFound.email }, { active: active.active, activeTime: active.time })
                        //     }
                        // }
                        
                        // activar la cuenta MAESTRA
                        // if(userFound.role === 'Admin' && !userFound.active){
                            // añadirUsuario(userFound.email, userFound.clientId, userFound.passMT5).then(async rpt =>{
                                // await addUserToCopyAdmin(userFound)
                                //     .catch(err =>{
                                //         console.log(err)
                                //         return res.status(200).json({
                                //             ok: true,
                                //             message: 'Error inesperado',
                                //             token
                                //         })
                                //     })
                            // }).catch(err =>{
                            //     console.log(err);
                            //     return res.status(500).json({
                            //         ok: true,
                            //         message: 'Error inesperado, intentelo más tarde'
                            //     })
                            // })
                        // }

                        // respuesta exitosa por parte del servidor
                        return res.status(200).json({
                            ok: true,
                            message: 'Inicio de sesión exitoso',
                            token
                        })

                    })
                    .catch(err =>{
                        console.log(err);
                        return res.status(403).json({
                            ok: false,
                            message: 'No autorizado'
                        })
                    })
            }
        }       
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: true,
            message: 'Error inesperado'
        })
    }
}

exports.logoutUser = async (req, res) =>{
    try {
        if(!req.session && !req.session.user){
            return res.status(403).json({
                ok: false,
                message: 'Debe iniciar sesión para realizar ésta acción'
            })
        }
        
        let deletedUser = await Session.findOneAndRemove({ email: req.session.user.email })
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(deletedUser){
            req.session.destroy()
            return res.status(200).json({
                ok: true,
                message: 'sesión cerrada'
            })
        }else{
            return res.status(404).json({
                ok: false,
                message: 'La sesión no existe'
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}