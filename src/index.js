const express = require('express')
const body_parser = require('body-parser')
const app = express()
const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')
const https = require('https')
const fs = require('fs')
const port = 9999

app.use(body_parser.json())
app.use(body_parser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send({ BoasVindas: 'Olá, seja bem vindo(a)' })
})

require('./app/controllers/')(app, web3)

https.createServer({
    key: fs.readFileSync(__dirname + '/conf/key.pem'),
    cert: fs.readFileSync(__dirname + '/conf/cert.pem')
}, app).listen(port)
console.log('Connected at ' + port)