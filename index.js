// Dependencies
var express = require('express')
var router = require("./modules/router")
var bodyParser = require('body-parser')
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var loginMiddleware = require('./modules/login-middleware')
const fs = require('fs')

// Global Variables
var app = express()

// Settings
try {
    var config = JSON.parse(fs.readFileSync('./config.json'))
} catch (e) {
    console.log('Bad config file.')
    process.exit()
}
app.set('port', (config.port || 4001))
app.set('view engine', 'pug')
app.use('/static', express.static(__dirname + '/static'))
app.listen(app.get('port'), function() {
	console.log('Hexo admin is running on port', app.get('port'))
})

// Body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Use the session middleware
app.use(session({
    store: new FileStore,
	secret: 'hexo-node-admin',
	resave: true,
    saveUninitialized: false
}))

// Login Middleware
app.use(loginMiddleware)

// Router
app.use('/', router)