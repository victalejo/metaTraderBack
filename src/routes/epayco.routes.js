const { Router } = require('express');

const routes = Router()

// Lib dónde está el método de pago
const { pago } = require('../lib/epayco');

// Authentication
const { authentication, authorization } = require('../auth/auth');

routes.post('/user/payment/membership', authentication, authorization, pago)

module.exports = routes