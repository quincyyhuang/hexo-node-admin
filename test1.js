var Hexo = require('hexo')
const path = require('path')

const hexoRoot = "H:\\projects\\Hexo"

var hexo = new Hexo(hexoRoot, {})

hexo.init().then(() => {
    hexo.post.create({
        title: 'Hi',
        layout: 'post'
    }, false).then(() => {
        return hexo.exit()
    })
})