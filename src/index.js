const express = require('express')
const body_parser = require('body-parser')
const app = express()

app.set('port', process.env.PORT || 3000)
app.use(body_parser.json())
app.use(body_parser.urlencoded({ extended: false }))

require('./app/controllers')(app)

app.listen(app.get('port'), () => console.log('Express server listen on port ' + app.get('port')))