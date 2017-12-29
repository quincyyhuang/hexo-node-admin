// Dependencies
const fs = require('fs')
var express = require('express')
var functions = require('./functions')

// Router
var router = express.Router()

// Routes
router.get('/', functions.index)

router.get('/!', (req, res) => {
    res.render('dashboard')
})

router.get('/!post', (req, res) => {
    res.render('post')
})

router.get('/!page', (req, res) => {
    res.render('page')
})

router.get('/!logout', functions.logout)

router.post('/!login', functions.login)

// Export
module.exports = router