const { Router } = require('express')

const routes = Router()

// Other routes
const routesUser = require('./user.routes');
const routesActiveUser = require('./activeUser.routes');
const routesMethodsUser = require('./methodsUser.routes');
const routesEpayco = require('./epayco.routes');

// Manejo de todas las rutas
routes.use(routesUser)
routes.use(routesActiveUser)
routes.use(routesMethodsUser)
routes.use(routesEpayco)

module.exports = routes