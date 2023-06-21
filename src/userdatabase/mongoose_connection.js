const mongoose = require('mongoose')

const users_TSF = require('./userdata')

mongoose.connect('mongodb://0.0.0.0:27017/TSF_users', { bufferCommands: false })
.then(() => { console.log('Mongoose connection successful') })
.catch((err) => { console.log(err) })
