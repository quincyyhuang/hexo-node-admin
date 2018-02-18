// Dependencies
const util = require('util')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
var formidable = require('formidable')
const { exec, execFile } = require('child_process')

// Promisify
const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const mkdir = util.promisify(fs.mkdir)
const rename = util.promisify(fs.rename)
const unlink = util.promisify(fs.unlink)
const rmdir = require('rmdir')

// Read settings
try {
    var config = JSON.parse(fs.readFileSync('./config.json'))
    
} catch (e) {
    console.log('Bad config file.')
    process.exit()
}

const hexoRoot = config.hexo_dir || __dirname

try {
    var config_yml = yaml.safeLoad(fs.readFileSync(path.join(hexoRoot, '_config.yml'), 'utf8'))
} catch (e) {
    console.log('Bad hexo config.yml file.')
    process.exit()
}

// Hexo directory paths
const hexoPostDir = path.join(hexoRoot, config_yml.source_dir, '_posts')
const hexoPageDir = path.join(hexoRoot, config_yml.source_dir)

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
        else if (req.query.a == 'getAssets' && config_yml.post_asset_folder == true) {
            // editor get assets
            try {
                var folder = path.join(hexoPostDir, fileName.replace(path.extname(fileName), ''))
                var assets = await readdir(folder)
            } catch (e) {
                console.log(e)
                return res.sendStatus(500)
            }
            return res.json({
                assets
            })
        }
        else {
            // Show editor
            return res.render('editor', {
                fileName: fileName,
                type: 'post',
                post_asset_folder: config_yml.post_asset_folder
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
        else if (req.query.a == 'getAssets' && config_yml.post_asset_folder == true) {
            // editor get assets
            try {
                var folder = path.join(hexoPageDir, fileName, 'index')
                var assets = await readdir(folder)
            } catch (e) {
                console.log(e)
                return res.sendStatus(500)
            }
            return res.json({
                assets
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
            }, false).then(() => {
                return hexo.exit()
            })

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
            }, false).then(() => {
                return hexo.exit()
            })

            hexo.on('new', (post) => {
                return res.sendStatus(200)
            })

        }).catch((err) => {
            console.log(err)
            res.sendStatus(400)
            return hexo.exit(err)
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
            if (config_yml.post_asset_folder == true) {
                await rmdir(path.join(hexoPostDir, fileName.replace(path.extname(fileName), '')))
            }
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
    switch (config.deploy.type) {
        case 'default': {
            // --------Not using hexo.call function because it doesn't throw error.
            // var Hexo = require('hexo')
            // var hexo = new Hexo(hexoRoot, {
            //     silent: true
            // })
            // hexo.init().then(() => {
            //     hexo.call('deploy', {}).then(() => {
                    
            //         return hexo.exit()
            //     }).catch((err) => {
            //         console.log(err)
            //         return res.sendStatus(500)
            //     })
            // })

            // Using exec command
            var command = 'hexo deploy'
            var options = {
                cwd: "H:\\projects\\Hexo"
            }
            var cb = (error, stdout, stderr) => {
                var rt = { error, stdout, stderr }
                return res.json(rt)
            }
            exec(command, options, cb)

            break
        }
        case 'script': {
            var script = config.deploy.script
            if (!script) return res.json({ error: '脚本不能为空' })
            if (path.isAbsolute(script)) {
                // Is file
                if (process.platform == 'win32' && (path.extname(script) != '.cmd' || path.extname(script) != '.bat')) return res.json({ error: '在 Windows 平台上脚本后缀名应为 .cmd 或者 .bat' })
                var options = {
                    cwd: config.hexo_dir
                }
                var cb = (error, stdout, stderr) => {
                    var rt = { error, stdout, stderr }
                    return res.json(rt)
                }
                execFile(script, [], options, cb)
            }
            else {
                // Is command
                var command = script
                var options = {
                    cwd: config.hexo_dir
                }
                var cb = (error, stdout, stderr) => {
                    var rt = { error, stdout, stderr }
                    return res.json(rt)
                }
                exec(command, options, cb)
            }
            
            break
        }
        default: {
            return res.json({
                error: '错误的部署设置'
            })
        }
    }
}

async function clean(req, res) {
    if (req.body.clean != undefined) {
        if (req.body.clean === true) {
            var Hexo = require('hexo')
            var hexo = new Hexo(hexoRoot, {
                silent: true
            })
            hexo.init().then(() => {
                hexo.call('clean').then(() => {
                    res.sendStatus(200)
                    return hexo.exit()
                }).catch((err) => {
                    res.sendStatus(500)
                    return hexo.exit(err)
                })
            })
        }
    }
}

async function upload(req, res) {
    if (!(req.query.type && req.query.fileName) || !(config_yml.post_asset_folder == true)) return res.sendStatus(400)
    else {
        var form = new formidable.IncomingForm()
        form.keepExtensions = true
        if (req.query.type == 'post') {
            var folder = path.join(hexoPostDir, req.query.fileName.replace(path.extname(req.query.fileName), ''))
            form.uploadDir = folder
            try {
                await mkdir(folder)
            } catch (e) {
                if (e.errno != -4075) return res.sendStatus(500)
            }
        }
        else if (req.query.type == 'page') {
            var folder = path.join(hexoPageDir, req.query.fileName, 'index')
            form.uploadDir = folder
            try {
                await mkdir(folder)
            } catch (e) {
                if (e.errno != -4075) return res.sendStatus(500)
            }
        }
        else return res.sendStatus(400)

        form.parse(req, async (err, fields, files) => {
            // console.log(files)
            try {
                await rename(files.file.path, path.join(path.dirname(files.file.path), files.file.name))
            } catch (e) {
                console.log(e)
                return res.sendStatus(500)
            }
            return res.sendStatus(200)
        })
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
exports.upload = upload