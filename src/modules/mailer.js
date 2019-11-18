const { host, port, user, pass } = require('../config/mail')
const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')
const path = require('path')

const transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass }
})

transport.use('compile', hbs({
    viewEngine: {
        extName: '.html',
        partialsDir: path.resolve('./src/resources/mail/auth'),
        layoutsDir: path.resolve('./src/resources/mail/auth'),
        defaultLayout: 'forgotPassword.html',
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html'
}))

module.exports = transport