var Hexo = require('hexo')
const path = require('path')

const hexoRoot = "H:\\projects\\Hexo"

var hexo = new Hexo(hexoRoot, {})

hexo.init().then(() => {
    hexo.call('generate').then(function(){
        return hexo.exit()
    }).catch(function(err){
        return hexo.exit(err)
    })

    hexo.on('generateBefore', () => {
        console.log('NONONONONONO')
    })

    hexo.on('generateAfter', () => {
        console.log('OKOKOKOKOKOK')
    })
})