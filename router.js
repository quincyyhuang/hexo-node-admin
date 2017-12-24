// Dependencies
const fs = require('fs')
var express = require('express')

// Read settings
var config = JSON.parse(fs.readFileSync('./config.json'))
const hexo_dir = config.dir || __dirname

// Router
var router = express.Router()

// Routes
router.get('/', (req, res) => {
    if (req.session.loggedIn == true) {
        res.redirect('/!')
    } else {
        res.render('login')
    }
})

router.get('/!', (req, res) => {
    res.render('dashboard')
})

router.get('/!post', (req, res) => {
    res.render('post')
})

router.get('/!page', (req, res) => {
    res.render('page')
})

router.get('/!logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

router.post('/!login', (req, res) => {
    if (req.body.username == config.admin.username && req.body.password == config.admin.password) {
        req.session.loggedIn = true
        res.redirect('/!')
    } else {
        res.redirect('/')
    }
})

// Export
module.exports = router