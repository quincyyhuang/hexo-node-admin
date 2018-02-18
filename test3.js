// test.js

var Hexo = require('hexo')
const path = require('path')

const hexoRoot = "H:\\projects\\Hexo"

var hexo = new Hexo(hexoRoot, {})

hexo.init().then(() => {
    hexo.call('deploy', {})
    .then(() => {
        console.log('No error is caught.')
    })
    .catch(err => {
        if (err) console.log('Error is caught.')
    })
})

hexo.on('deployAfter', () => {
    console.log('Deploy finished.')
})