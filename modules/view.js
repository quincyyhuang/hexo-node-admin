// Dependencies
const util = require('util')
const fs = require('fs')
const path = require('path')

// Promisify
const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const unlink = util.promisify(fs.unlink)
const rmdir = require('rmdir')

// Read settings
var config = JSON.parse(fs.readFileSync('./config.json'))
const hexoRoot = config.hexo_dir || __dirname

// Hexo directory paths
const hexoPostDir = path.join(hexoRoot, 'source', '_posts')
const hexoPageDir = path.join(hexoRoot, 'source')

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

async function dashboard(req, res) {
    try {
        var postDirFiles = await readdir(hexoPostDir)
        var pageDirFiles = await readdir(hexoPageDir)
        var posts = []
        for (var i = 0; i < postDirFiles.length; i++) {
            if (postDirFiles[i].includes('md')) posts.push(postDirFiles[i])
        }
        var pages = []
        for (var i = 0; i < pageDirFiles.length; i++) {
            if (pageDirFiles[i] != '_posts' && pageDirFiles[i] != '_drafts') pages.push(pageDirFiles[i])
        }
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }

    res.render('dashboard', {
        postCounts: posts.length,
        pageCounts: pages.length
    })
}

async function post(req, res) {
    // Show all posts
    try {
        var postDirFiles = await readdir(hexoPostDir)
        var posts = []
        for (var i = 0; i < postDirFiles.length; i++) {
            if (postDirFiles[i].includes('md')) posts.push(postDirFiles[i])
        }
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
    
    res.render('post', {
        posts: posts
    })
}

async function page(req, res) {
    // Show all pages
    try {
        var pageDirFiles = await readdir(hexoPageDir)
        var pages = []
        for (var i = 0; i < pageDirFiles.length; i++) {
            if (pageDirFiles[i] != '_posts' && pageDirFiles[i] != '_drafts') pages.push(pageDirFiles[i])
        }
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
    
    res.render('page', {
        pages: pages
    })
}

async function showPost(req, res) {
    if (!req.query.f) {
        res.redirect('/!post')
    }
    else {
        var fileName = req.query.f
        try {
            var fileContent = await readFile(path.join(hexoPostDir, fileName), 'utf-8')
        } catch (e) {
            console.log(e)
            return res.redirect('/!post')
        }
        if (req.query.a == 'getContent') {
            // editor get content
            return res.json({
                content: fileContent
            })
        }
        else {
            // Show editor
            return res.render('editor', {
                fileName: fileName,
                type: 'post'
            })
        }
    }
}

async function showPage(req, res) {
    if (!req.query.f) {
        res.redirect('/!page')
    }
    else {
        var fileName = path.join(req.query.f, 'index.md')
        try {
            var fileContent = await readFile(path.join(hexoPageDir, fileName), 'utf-8')
        } catch (e) {
            console.log(e)
            return res.redirect('/!page')
        }
        if (req.query.a == 'getContent') {
            // editor get content
            return res.json({
                content: fileContent
            })
        }
        else {
            // Show editor
            return res.render('editor', {
                fileName: path.dirname(fileName),
                type: 'page'
            })
        }
    }
}

async function newFile(req, res) {
    var Hexo = require('hexo')
    var hexo = new Hexo(hexoRoot, {
        debug: false
    })
    if (req.body.type == 'post' && req.body.title) {
        hexo.init().then(() => {
            hexo.post.create({
                title: req.body.title,
                layout: 'post'
            }, false)

            hexo.on('new', (post) => {
                return res.sendStatus(200)
            })
        }).catch((err) => {
            console.log(err)
            return res.sendStatus(400)
        })
    }
    else if (req.body.type == 'page' && req.body.title) {
        hexo.init().then(() => {
            hexo.post.create({
                title: req.body.title,
                layout: 'page'
            }, false)

            hexo.on('new', (post) => {
                return res.sendStatus(200)
            })
        }).catch((err) => {
            console.log(err)
            return res.sendStatus(400)
        })
    }
    else {
        return res.sendStatus(400)
    }
}

async function save(req, res){
    var fileName = req.body.fileName
    var type = req.body.type
    var content = req.body.content
    if (type == 'post') {
        try {
            await writeFile(path.join(hexoPostDir, fileName), content, 'utf8')
        } catch (e) {
            console.log(e)
            return res.sendStatus(400)
        }
        return res.sendStatus(200)
    }
    else if (type == 'page') {
        try {
            await writeFile(path.join(hexoPageDir, fileName, 'index.md'), content, 'utf8')
        } catch (e) {
            console.log(e)
            return res.sendStatus(400)
        }
        return res.sendStatus(200)
    }
    else {
        return res.sendStatus(400)
    }
}

async function deleteFn(req, res){
    var fileName = req.body.fileName
    var type = req.body.type
    if (type == 'post') {
        try {
            await unlink(path.join(hexoPostDir, fileName))
        } catch (e) {
            console.log(e)
            return res.sendStatus(400)
        }
        return res.sendStatus(200)
    }
    else if (type == 'page') {
        try {
            await rmdir(path.join(hexoPageDir, fileName))
        } catch (e) {
            console.log(e)
            return res.sendStatus(400)
        }
        return res.sendStatus(200)
    }
    else {
        return res.sendStatus(400)
    }
}

async function generate(req, res) {
    var Hexo = require('hexo')
    var hexo = new Hexo(hexoRoot, {
        silent: true
    })
    hexo.init().then(() => {
        hexo.call('generate').then(function(){
            return hexo.exit()
        }).catch((err) => {
            console.log(err)
            return res.sendStatus(500)
        })
    
        hexo.on('generateAfter', () => {
            return res.sendStatus(200)
        })
    })
}

async function deploy(req, res) {

}

async function clean(req, res) {
    if (req.body.clean != undefined) {
        if (req.body.clean === true) {
            rmdir(path.join(hexoRoot, 'public'), (err) => {
                if (err) {
                    console.log(err)
                    return res.sendStatus(400)
                }
                else return res.sendStatus(200)
            })
        }
    }
}

// Exports
exports.index = index
exports.login = login
exports.logout = logout
exports.dashboard = dashboard
exports.page = page
exports.post = post
exports.showPost = showPost
exports.showPage = showPage
exports.newFile = newFile
exports.save = save
exports.deleteFn = deleteFn
exports.generate = generate
exports.deploy = deploy
exports.clean = clean