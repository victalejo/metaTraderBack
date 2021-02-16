const User = require('../models/User');
const { createdToken } = require('../jwt/jwt');

exports.loginAdmin = async (req, res) =>{
    try {
        let { email, password } = req.body

        if(!email || !password){
            return res.status(401).json({
                ok: false,
                message: 'Todos los campos son requeridos'
            })
        }

        // Verificar que no haya sesión
        if(req.session.user){
            return res.status(403).json({
                ok: false,
                message: 'Ya inició sesión'
            })
        }

        // Valida que el correo ingresado sea correcto sintácticamente
        let validEmail = /^[\w-ñÑÀ-ÿ!"#$%&|=¿<>()\/@.;,:_?'{}^+*[\]`~]{4,30}@[\w]{2,15}\.[\w]{2,15}$/.test(email)

        if(!validEmail){
            return res.status(401).json({
                ok: false,
                message: 'Correo y/o contraseña inválida'
            })
        }

        // Valida que la contraseña ingresado sea correcta sintácticamente
        let validPass = /^[\w!"#|$%&\/()'=-_.:,;{}`*+'<>]{6,50}$/.test(password)

        if(!validPass){
            return res.status(401).json({
                ok: false,
                message: 'Correo y/o contraseña inválida'
            })
        }

        // Busca en la DB si el usuario existe
        let user = await User.findOne({ email })
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
                message: 'El usuario y/o contraseña no existe'
            })
        }

        // valida que sea un usuario administrador
        if(user.role !== 'Admin'){
            return res.status(403).json({
                ok: false,
                message: 'No autorizado'
            })
        }

        // Validar si la contraseña coincide con el hash de contraseña en la DB
        let passFound = await user.comparePassword(password)
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(!passFound){
            return res.status(404).json({
                ok: false,
                message: 'El usuario y/o contraseña no existe'
            })
        }

        // payload para la sesion y el jwt
        let payload = {
            id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            activo: user.active
        }

        // creación del token con JWT
        let token = await createdToken(payload)
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        // datos del usuario en la sesión del servidor
        req.session.user = {
            name: user.name,
            lastName: user.lastName,
            email: user.email
        }

        return res.status(200).json({
            ok: true,
            message: 'Inicio de sesion exitoso',
            token
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}