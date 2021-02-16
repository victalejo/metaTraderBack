const { Router } = require('express');

const routes = Router();

// Contollers
const {
    updateUser,
    updateDataUser,
    updateDataUserMT,
    updateImg,
    deleteImg,
    getUser
} = require('../controllers/methodsUserController');

// Authentication
const { authentication, authorization } = require('../auth/auth');

// Rutas de la API
routes.put('/updateUser/:id', authentication, authorization, updateUser)
routes.put('/update/data/user/:id', authentication, authorization, updateDataUser)
routes.put('/update/data/userMT/:id', authentication, authorization, updateDataUserMT)
routes.put('/update/Img/:id', authentication, authorization, updateImg)
routes.delete('/deleteImg/:id', authentication, authorization, deleteImg)
routes.get('/getUser/:id', authentication, authorization, getUser)

module.exports = routes;