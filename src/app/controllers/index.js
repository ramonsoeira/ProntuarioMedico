const fs = require('fs')
const pathManag = require('path')

module.exports = (app, web3) => {
    fs
    .readdirSync(__dirname)
    .filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))
    .forEach(file => require(pathManag.resolve(__dirname, file))(app, web3))
}