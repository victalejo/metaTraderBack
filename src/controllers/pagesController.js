const User = require('../models/User');

// pasar datos del usuario a actualizar
exports.pageUpdate = async (req, res) =>{
    try {
        let { id } = req.params

        if(!id){
            return res.status(401).json({
                ok: false,
                message: 'Datos incompletos'
            })
        }
    
        let user = await User.findById(id).select({ _id: 0, passMT5: 0, password: 0, active: 0, role: 0, createdAt: 0, updatedAt: 0, __v: 0 })
            .catch(err =>{
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(user.email != req.session.user.email){
            return res.status(403).json({
                ok: false,
                message: 'No puede realizar ésta acción'
            })
        }
    
        if(!user){
            return res.status(404).json({
                ok: false,
                messgae: 'Error inesperado'
            })
        }
    
        return res.status(200).json({
            ok: true,
            user
        })       
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: flase,
            message: 'Error inesperado'
        })
    }
}

exports.getAllUsers = async (req, res) =>{
    try {
        let users = await User.find({ role: 'Cliente' },
        { role: 0, _id: 0, passMT5: 0, password: 0, createdAt: 0, updatedAt: 0, __v: 0 })
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })

        if(!users){
            return res.status(404).json({
                ok: false,
                message: 'No se encontraron usuarios'
            })
        }

        if(users === [] || users.length === 0){
            return res.status(404).json({
                ok: false,
                message: 'No se encontraron usuarios'
            })
        }

        return res.status(200).json({
            ok: true,
            data: users
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: true,
            message: 'Error inesperado'
        })
    }
}