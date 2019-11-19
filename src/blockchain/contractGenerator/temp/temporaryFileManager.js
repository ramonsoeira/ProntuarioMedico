const { readFileSync, readdirSync } = require('fs')

module.exports = (typeContract, extension) => {
    return readFileSync(__dirname+'/'+readdirSync(__dirname).find(file=>file.includes(typeContract+'.'+extension)), 'utf8')
}