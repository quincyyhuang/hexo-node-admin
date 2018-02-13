// Dependencies
const fs = require('fs')

// Read settings
var config = JSON.parse(fs.readFileSync('./config.json'))
const hexo_dir = config.dir || __dirname

// Functions
function index(req, res) {
    if (req.session.loggedIn == true) {
        res.redirect('/!')
    } else {
        res.render('login')
    }
}

function login(req, res) {
    if (req.body.username == config.admin.username && req.body.password == config.admin.password) {
        req.session.loggedIn = true
        res.redirect('/!')
    } else {
        res.redirect('/')
    }
}

function logout(req, res) {
    req.session.destroy()
    res.redirect('/')
}

function dashboard(req, res) {
    
}

// Exports
exports.index = index
exports.login = login
exports.logout = logout
exports.dashboard = dashboard