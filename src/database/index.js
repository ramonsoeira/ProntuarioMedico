const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/noderest', { useFindAndModify: false })
mongoose.Promise = global.Promise

module.exports = mongoose