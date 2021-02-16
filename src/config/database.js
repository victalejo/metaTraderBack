const mongoose = require('mongoose')

mongoose.connect(process.env.MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => console.log('Base de datos conectada'))
    .catch(err => console.log(err));