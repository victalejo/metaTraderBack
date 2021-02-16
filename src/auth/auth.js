const User = require('../models/User');
const { verifyToken } = require('../jwt/jwt')

// comprobar si el usuario está autenticado
exports.authentication = (req, res, next) =>{
    // si la sesion del usuario no existe no puede avanzar
    if(!req.session || !req.session.user){
        return res.status(403).json({
            ok: false,
            message: 'No autorizado'
        })
    }

    return next()
}

// comprobar autorizacion del usuario
exports.authorization = (req, res, next) =>{
    let { authorization } = req.headers
    
    if(!authorization){
        return res.status(403).json({
            ok: false,
            message: 'No autorizado'
        })
    }

    // extraer el token de tipo Bearer
    let token = authorization.split(' ')[1]

    // verificar que el token sea valido
    verifyToken(token)
        .then(decoded =>{
            next()
        })
        .catch(err =>{
            return res.status(403).json({
                ok: false,
                message: err
            })
        })
}


// comprobar si el usuario es administrador
exports.isAdmin = async (req, res, next) =>{
    try {
        // extraer usuarion de la DB para comprobar su rol
        let userDB = await User.findOne({ email: req.session.user.email })
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })
        
        if(!userDB){
            return res.status(404).json({
                ok: false,
                message: 'Acceso Denegado'
            })
        }

        if(userDB.role !== 'Admin'){
            return res.status(403).json({
                ok: false,
                message: 'Acceso Denegado'
            })
        }

        return next()

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado'
        })
    }
}