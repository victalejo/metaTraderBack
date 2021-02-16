const { Router } = require('express');

const routes = Router()

// Controllers
const { userRegister, userLogin, logoutUser } = require('../controllers/userController');
const { pageUpdate } = require('../controllers/pagesController');
const { loginAdmin } = require('../controllers/adminLoginController');

// Authentication
const { authentication, authorization } = require('../auth/auth');

// Rutas de la API
routes.post('/userRegister', userRegister)
routes.post('/userLogin', userLogin)
routes.post('/user/login/', loginAdmin)
routes.get('/pageUpdateUser/:id', authentication, authorization, pageUpdate)
routes.delete('/logoutUser', authentication, authorization, logoutUser)

module.exports = routes