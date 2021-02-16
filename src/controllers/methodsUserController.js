const User = require('../models/User');
const Session = require('../models/Session');
const Country = require('../models/countries');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
// const MetaApi = require('metaapi.cloud-sdk');

// const metaApi = MetaApi.default;

// const token = process.env.TOKEN;

// const api = new metaApi(token);

// Obtener datos de un usuario en especifíco
exports.getUser = async (req, res) =>{
    try {
        let { id } = req.params

        if(!id) return res.status(401).json({
                ok: false,
                message: 'url incompleta'
            })

        let user = await User.findById(id, { _id: 0, role: 0, passMT5: 0, password: 0, createdAt: 0, updatedAt: 0, __v: 0 })
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(!user){
            return res.status(404).json({
                ok: false,
                message: 'No se encontró un usuario'
            })
        }
        
        if(user.email != req.session.user.email){
            return res.status(403).json({
                ok: false,
                message: 'No autorizado'
            })
        }

        return res.status(200).json({
            ok: true,
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}

// actualizar datos del usuario
exports.updateUser = async (req, res) =>{
    try {
        let { name, lastName, phone, country } = req.body
        let { id } = req.params

        if(!name || !lastName || !phone || !country || !id) return res.status(401).json({
                ok: false,
                message: 'Todos los campos son requeridos'    
            })

        let user = await User.findById(id)
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(user.email != req.session.user.email){
            return res.status(403).json({
                ok: false,
                message: 'No autorizado'
            })
        }
    
        // verificar que todos los datos esten pendientes
        if(!name || !lastName || !phone || !country){
            return res.status(401).json({
                ok: false,
                message: 'Todos los campos son requeridos'
            })
        }
        
        // validar datos
        if(!/^([\w-!#_:;.,]{3,}\s?)([\w-!#_:;.,]{3,})?$/g.test(name)){
            return res.status(401).json({
                ok: false,
                message: 'El nombre es inválido'
            })
        }
        
        if(!/^([\w-!#_:;.,]{3,}\s?)([\w-!#_:;.,]{3,})?$/g.test(lastName)){
            return res.status(401).json({
                ok: false,
                message: 'El apellido es inválido'
            })
        }
        
        // validar datos
        if(!/^[0-9]{9,12}$/g.test(phone)){
            return res.status(401).json({
                ok: false,
                message: 'El número de teléfono es inválido'
            })
        }

        if(!/^([a-zA-ZñÑúá]{4,}\s?)([a-zA-Z]{3,})?$/.test(country)){
            return res.status(401).json({
                ok: false,
                message: 'El país es inválido'
            })
        }

        // pasar todo el pais a minuscula
        country = country.toLowerCase()
        // capitalizar el pais
        country = country.replace(/\w\S*/g, w => w.replace(/^\w/, w => w.toUpperCase()))

        // verificar si el pais existe en la DB
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

        let newUser = await User.findOneAndUpdate({ email: req.session.user.email }, { name, lastName, phone, country }, { new: true })
            .select({ name: 1, lastName: 1, phone: 1, country: 1, _id: 0 })
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })
    
        return res.status(200).json({
            ok: true,
            newUser
        })       
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}

// Actualizar los datos del usuario
// con los que inicia sesión
exports.updateDataUser = async (req, res) =>{
    try {
        let { email, oldPass, newPass } = req.body
        let { id } = req.params

        if(!id) return res.status(401).json({
                ok: false,
                message: 'url incompleta'
            })

        if(!email && !oldPass && !newPass) return res.status(401).json({
                ok: false,
                message: 'No se han recibido datos para actualizar'
            })

        let user = await User.findById(id)
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(!user) return res.status(404).json({
                ok: false,
                message: 'No se encontró un usuairo para actualizar los datos'
            })

        console.log(user.email)
        console.log(req.session.user.email)
        if(user.email != req.session.user.email){
            return res.status(403).json({
                ok: false,
                message: 'No autorizado'
            })
        }

        let dataUserUpdate = {}

        if(email){
            if(!/^[\w-!"#$%&()'?´`+=*_:.;,^{}]{4,}@[\w-]{3,}\.[\w-]{2,}$/g.test(email)){
                return res.status(401).json({
                    ok: false,
                    message: 'El correo electrónico es inválido'
                })
            }

            dataUserUpdate.email = email
        }

        if(oldPass || newPass){
            if(oldPass && newPass){
                if(!/^[\w-!"#$%&/()='?¨*´+{}_:.;,]{6,}$/g.test(oldPass)){
                    return res.status(401).json({
                        ok: false,
                        message: 'La contraseña actual es inválida'
                    })
                }
        
                if(!/^[\w-!"#$%&/()='?¨*´+{}_:.;,]{6,}$/g.test(newPass)){
                    return res.status(401).json({
                        ok: false,
                        message: 'La nueva contraseña es inválida'
                    })
                }

                // comprobar que las contraseñas tengan más de 6 caracteres
                if(oldPass.length < 6 || newPass.length < 6){
                    return res.status(401).json({
                        ok: false,
                        message: 'La contraseña debe tener al menos 6 caractéres'
                    })
                }

                // verificar que la contraseña actual sea correcta
                let passValid = await user.comparePassword(oldPass)
                .catch(err => {
                    console.log(err)
                    return res.status(500).json({
                        ok: false,
                        message: 'Error inesperado'
                    })
                })

                if(!passValid){
                    return res.status(403).json({
                        ok: false,
                        message: 'La contraseña actual es incorrecta'
                    })
                }

                let password = bcrypt.hashSync(newPass, 10)

                dataUserUpdate.password = password
            }else{
                return res.status(401).json({
                    ok: false,
                    message: 'la contraseña actual y nueva son requeridas para actualizar la contraseña'
                })
            }
        }

        let newUser = await User.findOneAndUpdate({ email: user.email }, dataUserUpdate, { new: true })
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(email){
            console.log('actualiza los datos de la sesión')
            await Session.updateOne({ email: user.email }, { email })
                    .catch(err =>{
                        console.log(err)
                        return res.status(500).json({
                            ok: false,
                            message: 'Error inesperado'
                        })
                    })

            req.session.user.email = email
            console.log(req.session.user)
        }

        return res.status(200).json({
            ok: true,
            message: `Datos del usuario ${newUser.name} ${newUser.lastName} actualizados`
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}

// Actualizar los datos de MetaTrader del usuario
exports.updateDataUserMT = async (req, res) =>{
    try {
        let { clientId, passMT5, newPassMT5 } = req.body;
        let { id } = req.params

        // Valida que en la url se esté pasando el id del usuario
        if(!id) return res.status(401).json({
                ok: false,
                message: 'url incompleta'
            })

        // valida que envíen algún dato para ser actualizado
        if(!clientId && !passMT5 && !newPassMT5) return res.status(401).json({
                ok: false,
                message: 'No se recibieron datos para actualizar'
            })

        // busqueda del usuario por el id recibido por la url
        let userTest = await User.findById(id)
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(!userTest) return res.status(404).json({
                ok: false,
                message: 'No se encontró un usuario al cual actualizar los datos'
            })

        // Valida que el usuario buscado sea el que haya iniciado sesion
        if(userTest.email != req.session.user.email) return res.status(403).json({
                ok: false,
                message: 'No autorizado'
            })

        // objeto con los datos a actualizar
        let dataUpdateUser = {}

        if(clientId){
            if(!/^[0-9]{5,}$/g.test(clientId)) return res.status(401).json({
                ok: false,
                message: 'El id del cliente es inválido'
            })

            dataUpdateUser.clientId = clientId
        }

        if(passMT5 || newPassMT5){
            // Valida que las 2 contraseñas sean enviadas
            // sino devuelve un error de que las 2 contraseñas son requeridas
            if(passMT5 && newPassMT5){
                // comprobar que hayan enviado la contraseña de meta trader para actualizarla
                if(!/^[\w-!"#$%&/()='?¨*´+{}_:.;,]{6,}$/g.test(passMT5)) return res.status(401).json({
                    ok: false,
                    message: 'La contraseña de Meta Trader es inválida'
                })
        
                if(!/^[\w-!"#$%&/()='?¨*´+{}_:.;,]{6,}$/g.test(newPassMT5)) return res.status(401).json({
                        ok: false,
                        message: 'La contraseña de Meta Trader es inválida'
                    })

                // verificar que la contraseña de mt5 actual sea correcta
                if(passMT5 != userTest.passMT5) return res.status(401).json({
                    ok: false,
                    message: 'La contraseña actual de meta trader es incorrecta'
                })

                dataUpdateUser.passMT5 = newPassMT5
            }else{
                return res.status(401).json({
                    ok: false,
                    message: 'La contraseña actual de metaTrader y la nueva son necesarias para actualizarlas'
                })
            }
        } 

        // let account = await api.metatraderAccountApi.getAccount(userTest.idAccountMTC)

        // await account.update({
        //     name: account._data.name,
        //     login: clientId,
        //     password: newPassMT5,
        //     server: account._data.server,
        //     quoteStreamingIntervalInSeconds: 2.5
        // })
        //     .catch(err =>{
        //         console.log(err)
        //         return res.status(500).json({
        //             ok: false,
        //             message: 'Ocurrió un error al actualizar los datos de metaTrader'
        //         })
        //     })

        await User.updateOne({ email: userTest.email }, dataUpdateUser, { new: true })
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        return res.status(200).json({
            ok: true,
            message: 'Datos de metaTrader del Usuario actualizados'
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}

// Actualizar la imagen del usuario
exports.updateImg = async (req, res) =>{
    try {
        let { id } = req.params

        if(!id) return res.status(401).json({
                ok: false,
                mesage: 'url incompleta'
            })

        let userTest = await User.findById(id)
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(!userTest){
            return res.status(404).json({
                ok: false,
                message: 'No se encontró un usuairo al cuál actualizar la imagen'
            })
        }

        if(userTest.email != req.session.user.email){
            return res.status(403).json({
                ok: false,
                message: 'No autorizado'
            })
        }

        if(!req.files || Object.keys(req.files).length < 1){
            return res.status(401).json({
                ok: false,
                message: 'No se encontró una imagen para actualizar'
            })
        }else{
            let { avatar } = req.files
            
            let ext = path.extname(avatar.name).toLowerCase()
            if(ext != '.jpg' && ext != '.jpeg' && ext != '.png'){
                return res.status(401).json({
                    ok: false,
                    message: 'Tipo de archivo no permitido'
                })
            }
    
            let user = await User.findOne({ email: req.session.user.email })
                .catch(err =>{
                    console.log(err);
                    return res.status(500).json({
                        ok: false,
                        message: 'Error inesperado'
                    })
                })
    
            let pathImgSave = path.join(__dirname, '../', '../', 'public', 'assets', 'images', user.avatar);
            
            if(fs.existsSync(pathImgSave) && path.basename(pathImgSave) != "default.jpg"){
                fs.unlinkSync(pathImgSave)
            }
    
            let img = `${uuidv4()}${path.extname(avatar.name)}`
    
            await avatar.mv(path.join(__dirname, '../', '../', 'public', 'assets', 'images', img))
                .catch(err =>{
                    console.error(err);
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al subir la imagen'
                    })
                })

            let imgUpdate = await User.findOneAndUpdate({ email: user.email }, { avatar: img }, { new: true })
                .catch(err =>{
                    console.log(err)
                    return res.status(500).json({
                        ok: false,
                        message: 'Error inesperado'
                    })
                })
            
            return res.status(200).json({
                ok: true,
                message: 'Imagen actualizada',
                img: imgUpdate.avatar
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}

// Eliminar la imagen actual del usuario y añadir la imagen por defecto
// No se elimina la imagen si es la imagen por defecto
exports.deleteImg = async (req, res) =>{
    try {
        let { id } = req.params

        if(!id) return res.status(401).json({
                ok: false,
                message: 'url incompleta'
            })

        let user = await User.findOne({ email: req.session.user.email })
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
                message: 'Debe iniciar sesión para realizar ésta acción'
            })
        }

        let userTest = await User.findById(id)
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(userTest.email != req.session.user.email){
            return res.status(403).json({
                ok: false,
                message: 'No autorizado'
            })
        }

        let pathImg = path.join(__dirname, '../', '../', 'public', 'assets', 'images', user.avatar)
        if(fs.existsSync(pathImg) && path.basename(pathImg) != 'default.jpg'){
            fs.unlinkSync(pathImg)
        }else{
            return res.status(400).json({
                ok: false,
                message: 'No existe una imagen a eliminar'
            })
        }

        await User.findOneAndUpdate({ email: req.session.user.email }, { avatar: 'default.jpg' })
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        return res.status(200).json({
            ok: true,
            message: 'Imagen eliminada'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}