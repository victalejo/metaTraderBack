const { Router } = require('express');

const routes = Router()

// Controllers
const { activatedUser, deactivateUser } = require('../controllers/activarUserController');
const { getAllUsers } = require('../controllers/pagesController');

// Authentication
const { authentication, authorization, isAdmin } = require('../auth/auth');

// Rutas de la API
routes.get('/page/manage/users', authentication, authorization, isAdmin, getAllUsers)
routes.put('/activateUser', authentication, authorization, isAdmin, activatedUser)
routes.put('/deactivateUser', authentication, authorization, isAdmin, deactivateUser)

module.exports = routes