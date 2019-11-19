const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')

module.exports = async () => {
    await Promise.all(fs.readdirSync(__dirname)
    .filter(arq => (arq!=='garbageCollector.js') && (arq!=='temporaryFileManager.js'))
    .map(file => { return exec('rm '+__dirname+'/'+file) }))
}