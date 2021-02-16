const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index.routes');
const helmet = require('helmet');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();

// Initializations
const PORT = process.env.PORT || 3000
dotenv.config()
require('./config/database')

// Habilitar cors
// const whiteList = ['http://greatstylefx.com/'];
const whiteList = ['http://localhost:4200'];
const corsOptions = {
    origin: (origin, callback) =>{
        const existe = whiteList.some(dominio => dominio === origin)
        if(existe){
            callback(null, true)
        }else{
            callback('Not allowed for cors')
        }
    },
    optionsSuccessStatus: 200,
    credentials: true
}

// Statics files
app.use(express.static('public'))

// deshabilita el X-Powered-By
app.disable("x-powered-by");

// middlewares
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
    secret: process.env.SECRETSESSION,
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        secure: false,
        maxAge: 60 * 60 * 24 * 1000,
        httpOnly: false
    }
}))
app.use(helmet())
app.use(fileUpload())

// Headers para la seguridad del servidor
app.use((req, res, next) =>{
    res.header('X-XSS-Protection', '1; mode=block')
    res.header('Content-Security-Policy', "default-src 'self';")
    res.header('Cache-Control', 'private, no-cache, no-store, max-age=0')
    next()
})

// routes
app.use('/api', routes)

// Server listening
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));