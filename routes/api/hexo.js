// Dependencies
const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const jwtMiddleware = require('./jwtMiddleware');
const fs = require('fs-extra');
const path = require('path');
const {exec, execFile} = require('child_process');
const Status = require('./status');

// Routes
/*
@method  GET
@path    '/posts/all'
@access  Authorized
@desc    Get all posts names.
*/
router.get('/posts/all', jwtMiddleware, (req, res) => {
  let hexoRootDir = req.app.get('config').hexo_dir;
  fs.readdir(path.resolve(hexoRootDir, 'source', '_posts'), (err, files) => {
    if (err)
      return res.status(500).json({'code': Status.HEXO_FAILED_TO_GET_POSTS});
    else
    {
      let posts = files.filter(file => path.extname(file) == '.md');
      posts = posts.map(post => path.basename(post, '.md'));
      return res.json(posts);
    }
  });
});

/*
@method  GET
@path    '/posts/:filename'
@access  Authorized
@desc    Get the content of filename.
*/
router.get('/posts/:filename', jwtMiddleware, (req, res) => {
  let hexoRootDir = req.app.get('config').hexo_dir;
  if (req.params.filename.includes('/'))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILENAME});
  const fp = path.resolve(hexoRootDir, 'source', '_posts', req.params.filename + '.md');
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({'code': Status.HEXO_FAILED_TO_OPEN_FILE});
    }
    else
      return res.json(data);
  });
});

/*
@method  GET
@path    '/pages/all'
@access  Authorized
@desc    Get all pages.
*/
router.get('/pages/all', jwtMiddleware, (req, res) => {
  let hexoRootDir = req.app.get('config').hexo_dir;
  fs.readdir(path.resolve(hexoRootDir, 'source'), { withFileTypes: true }, (err, files) => {
    if (err)
      return res.status(500).json({'code': Status.HEXO_FAILED_TO_GET_PAGES});
    else
    {
      let pages = files.filter(file => file.isDirectory() && !file.name.startsWith('.') && file.name != '_posts' && file.name != '_drafts');
      pages = pages.map(page => page.name);
      return res.json(pages);
    }
  });
});

/*
@method  GET
@path    '/pages/:pageName'
@access  Authorized
@desc    Get the page with name.
*/
router.get('/pages/:pageName', jwtMiddleware, (req, res) => {
  let hexoRootDir = req.app.get('config').hexo_dir;
  if (path.extname(req.params.pageName).length != 0 || req.params.pageName.includes('/'))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILENAME});
  const fp = path.resolve(hexoRootDir, 'source', req.params.pageName, 'index.md');
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err)
      return res.status(500).json({'code': Status.HEXO_FAILED_TO_OPEN_FILE});
    else
      return res.json(data);
  });
});

/*
@method  POST
@path    '/posts/:filename'
@access  Authorized
@desc    Write the content to filename.
*/
router.post('/posts/:filename', jwtMiddleware, (req, res) => {
  let hexoRootDir = req.app.get('config').hexo_dir;
  if (req.params.filename.includes('/'))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILENAME});
  const fp = path.resolve(hexoRootDir, 'source', '_posts', req.params.filename + '.md');
  fs.writeFile(fp, req.body.content, (err) => {
    if (err)
      return res.status(500).json({'code': Status.HEXO_FAILED_TO_WRITE_FILE});
    else
      return res.json({'code': Status.HEXO_WROTE_TO_FILE})
  });
});

/*
@method  POST
@path    '/pages/:pageName'
@access  Authorized
@desc    Write the page to page name.
*/
router.post('/pages/:pageName', jwtMiddleware, (req, res) => {
  let hexoRootDir = req.app.get('config').hexo_dir;
  if (req.params.pageName.includes('/'))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILENAME});
  const fp = path.resolve(hexoRootDir, 'source', req.params.pageName, 'index.md');
  fs.writeFile(fp, req.body.content, (err) => {
    if (err)
      return res.status(500).json({'code': Status.HEXO_FAILED_TO_WRITE_FILE});
    else
      return res.json({'code': Status.HEXO_WROTE_TO_FILE})
  });
});

/*
@method  GET
@path    '/generate'
@access  Authorized
@desc    Run hexo generate.
*/
router.get('/generate', jwtMiddleware, (req, res) => {
  let hexoRootDir = req.app.get('config').hexo_dir;
  var Hexo = require('hexo');
  var hexo = new Hexo(hexoRootDir, { silent: true });
  hexo.init()
    .then(() => {
      hexo.call('generate', {})
        .then(() => {
          res.json({'code': Status.HEXO_GENERATED});
          hexo.exit();
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({'code': Status.HEXO_FAILED_TO_GENERATE});
          hexo.exit();
        });
    });
});

/*
@method  GET
@path    '/clean'
@access  Authorized
@desc    Run hexo clean.
*/
router.get('/clean', jwtMiddleware, (req, res) => {
  let hexoRootDir = req.app.get('config').hexo_dir;
  var Hexo = require('hexo');
  var hexo = new Hexo(hexoRootDir, { silent: true });
  hexo.init()
    .then(() => {
      hexo.call('clean', {})
        .then(() => {
          res.json({'code': Status.HEXO_CLEANED});
          hexo.exit();
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({'code': Status.HEXO_FAILED_TO_CLEAN});
          hexo.exit();
        });
    });
});

/*
@method  GET
@path    '/deploy'
@access  Authorized
@desc    Run hexo deploy or custom deploy scripts.
*/
router.get('/deploy', jwtMiddleware, (req, res) => {
  let hexoRootDir = req.app.get('config').hexo_dir;
  const deployType = req.app.get('config').deploy.type;
  if (deployType == 'default')
  {
    let Hexo = require('hexo');
    let hexo = new Hexo(hexoRootDir, { silent: true });
    hexo.init()
      .then(() => {
        hexo.call('deploy', {})
          .then(() => {
            res.json({'code': Status.HEXO_DEPLOYED});
            hexo.exit();
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({'code': Status.HEXO_FAILED_TO_DEPLOY});
            hexo.exit();
          });
      });
  }
  else if (deployType == 'command')
  {
    let command = req.app.get('config').deploy.script;
    exec(command, { cwd: hexoRootDir }, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return res.status(500).json({'code': Status.HEXO_FAILED_TO_DEPLOY});
      }
      return res.json({'code': Status.HEXO_DEPLOYED});
    });
  }
  else if (deployType == 'script')
  {
    let scriptPath = req.app.get('config').deploy.script;
    if (!path.isAbsolute(scriptPath))
      scriptPath = path.resolve(hexoRootDir, scriptPath);
    if (process.platform == 'win32')
    {
      // On Windows
      scriptPath = scriptPath.replace(/ /g, '^ ');
      exec(scriptPath, { cwd: hexoRootDir }, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return res.status(500).json({'code': Status.HEXO_FAILED_TO_DEPLOY});
        }
        return res.json({'code': Status.HEXO_DEPLOYED});
      });
    }
    else
    {
      execFile(scriptPath, { cwd: hexoRootDir }, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return res.status(500).json({'code': Status.HEXO_FAILED_TO_DEPLOY});
        }
        return res.json({'code': Status.HEXO_DEPLOYED});
      });
    }
  }
  else
    return res.status(500).json({'code': Status.HEXO_BAD_DEPLOY_TYPE});
});

/*
@method  GET
@path    '/stats'
@access  Authorized
@desc    Get stats of the blog.
*/
router.get('/stats', jwtMiddleware, async (req, res) => {
  let hexoRootDir = req.app.get('config').hexo_dir;
  try {
    // get # of posts and pages
    let posts = await fs.promises.readdir(path.resolve(hexoRootDir, 'source', '_posts'));
    posts = posts.filter(post => path.extname(post) == '.md' && !post.startsWith('.'));
    let pages = await fs.promises.readdir(path.resolve(hexoRootDir, 'source'), { withFileTypes: true });
    pages = pages.filter(file => file.isDirectory() && !file.name.startsWith('.') && file.name != '_posts' && file.name != '_drafts');
    // Get hexo config
    let configYAML = req.app.get('config').yaml;
    return res.json({
      posts: posts.length,
      pages: pages.length,
      post_asset_folder: configYAML.post_asset_folder,
      deploy: req.app.get('config').deploy.type,
      theme: configYAML.theme
    });
  }
  catch (e) {
    console.error(e);
    return res.status(500).json({'code': Status.HEXO_FAILED_TO_GET_STATS});
  }
});

/*
@method  POST
@path    '/upload'
@access  Authorized
@desc    Upload post asset to post asset folder.
*/
router.post('/upload/:type/:name', jwtMiddleware, async (req, res) => {
  if (!['page', 'post'].includes(req.params.type))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILE_TYPE});
  let hexoRootDir = req.app.get('config').hexo_dir;
  let configYAML = req.app.get('config').yaml;
  if (!configYAML.post_asset_folder)
    return res.status(500).json({'code': Status.HEXO_POST_ASSETS_DISABLED});
  // Make dir ready
  if (req.params.type == 'post')
  {
    try {
      await fs.promises.access(path.resolve(hexoRootDir, 'source', '_posts', req.params.name + '.md'));
    } catch (e) {
      console.error(e);
      return res.status(400).json({'code': Status.HEXO_NO_POST});
    }
    var folder = path.resolve(hexoRootDir, 'source', '_posts', req.params.name);
    try {
      await fs.promises.access(folder)
    }
    catch (e) {
      try {
        await fs.promises.mkdir(folder);
      } catch (e) {
        return res.status(500).json({'code': Status.HEXO_FAILED_TO_CREATE_ASSET_FOLDER});
      }
    }
  }
  else if (req.params.type == 'page')
  {
    try {
      await fs.promises.access(path.resolve(hexoRootDir, 'source', req.params.name, 'index.md'));
    } catch (e) {
      console.error(e);
      return res.status(400).json({'code': Status.HEXO_NO_PAGE});
    }
    var folder = path.resolve(hexoRootDir, 'source', req.params.name, 'index');
    try {
      await fs.promises.access(folder)
    }
    catch (e) {
      try {
        await fs.promises.mkdir(folder);
      } catch (e) {
        return res.status(500).json({'code': Status.HEXO_FAILED_TO_CREATE_ASSET_FOLDER});
      }
    }
  }
  // Receive file
  const form = formidable({
    multiples: true,
    uploadDir: folder
  });
  form.parse(req);
  form.on('file', async (name, file) => {
    try {
      await fs.promises.rename(file.path, path.resolve(folder, file.name));
    }
    catch (e) {
      return res.status(500).json({'code': Status.HEXO_FAILED_TO_UPLOAD_FILE});
    }
  });
  form.on('end', () => {
    return res.json({'code': Status.HEXO_UPLOADED});
  });
});

/*
@method  GET
@path    '/assets/:type/:name/'
@access  Authorized
@desc    List all assets in post asset folder.
*/
router.get('/assets/:type/:name', jwtMiddleware, async (req, res) => {
  if (!['page', 'post'].includes(req.params.type))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILE_TYPE});
  if (req.params.name.includes('/'))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILENAME});
  let hexoRootDir = req.app.get('config').hexo_dir;
  let configYAML = req.app.get('config').yaml;
  // If post_asset_folder is enabled
  if (!configYAML.post_asset_folder)
    return res.status(500).json({'code': Status.HEXO_POST_ASSETS_DISABLED});
  let folder;
  if (req.params.type == 'post')
    folder = path.resolve(hexoRootDir, 'source', '_posts', req.params.name);
  else if (req.params.type == 'page')
    folder = path.resolve(hexoRootDir, 'source', req.params.name, 'index');
  // If folder does not exist, create folder
  fs.access(folder, (err) => {
    if (err)
      fs.mkdir(folder, (err) => {
        if (err)
          return res.status(500).json({'code': Status.HEXO_FAILED_TO_CREATE_ASSET_FOLDER});
        else
          return res.json([]);  // We just created the folder
      });
    else
      fs.readdir(folder, (err, files) => {
        if (err)
          return res.status(500).json({'code': Status.HEXO_FAILED_TO_GET_ASSETS});
        else {
          files = files.filter(file => !file.startsWith('.'));  // Remove hidden files from the list
          return res.json(files);
        }
      });
  });
});

/*
@method  GET
@path    '/delete/:type/:name/:filename'
@access  Authorized
@desc    Delete post asset in post asset folder.
*/
router.get('/delete/:type/:name/:filename', jwtMiddleware, async (req, res) => {
  if (!['page', 'post'].includes(req.params.type))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILE_TYPE});
  if (req.params.filename.includes('/'))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILENAME});
  let hexoRootDir = req.app.get('config').hexo_dir;
  if (req.params.type == 'post')
    var fp = path.resolve(hexoRootDir, 'source', '_posts', req.params.name, req.params.filename);
  else if (req.params.type == 'page')
    var fp = path.resolve(hexoRootDir, 'source', req.params.name, 'index', req.params.filename);
  try {
    await fs.promises.unlink(fp);
  } catch (e) {
    return res.status(500).json({'code': Status.HEXO_FAILED_TO_DELETE});
  }
  return res.json({'code': Status.HEXO_DELETED});
});

/*
@method  GET
@path    '/delete/:type/:name'
@access  Authorized
@desc    Delete page or post and their asset folder.
*/
router.get('/delete/:type/:name', jwtMiddleware, async (req, res) => {
  if (!['page', 'post'].includes(req.params.type))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILE_TYPE});
  if (req.params.name.includes('/'))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILENAME});
  let hexoRootDir = req.app.get('config').hexo_dir;
  if (req.params.type == 'post') {
    let fp = path.resolve(hexoRootDir, 'source', '_posts', req.params.name + '.md');
    let folderp = path.resolve(hexoRootDir, 'source', '_posts', req.params.name);
    try {
      await fs.promises.unlink(fp);
    } catch(e) {
      return res.status(500).json({'code': Status.HEXO_FAILED_TO_DELETE});
    }
    fs.remove(folderp, (err) => {
      if (err)
        return res.status(500).json({'code': Status.HEXO_FAILED_TO_DELETE});
      return res.json({'code': Status.HEXO_DELETED});
    });
  }
  else if (req.params.type == 'page') {
    let fp = path.resolve(hexoRootDir, 'source', req.params.name);
    fs.remove(fp, (err) => {
      if (err)
        return res.status(500).json({'code': Status.HEXO_FAILED_TO_DELETE});
      return res.json({'code': Status.HEXO_DELETED});
    });
  }
});

/*
@method  GET
@path    '/new/:type/:name'
@access  Authorized
@desc    Create new post or page.
*/
router.get('/new/:type/:name', jwtMiddleware, (req, res) => {
  if (!['post', 'page'].includes(req.params.type))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILE_TYPE});
  if (req.params.name.includes('/'))
    return res.status(400).json({'code': Status.HEXO_ILLEGAL_FILENAME});
  let hexoRootDir = req.app.get('config').hexo_dir;
  let Hexo = require('hexo');
  let hexo = new Hexo(hexoRootDir, { silent: true });
  hexo.init()
    .then(() => {
      hexo.post.create({
        title: req.params.name,
        layout: req.params.type
      }, false)
      .then(() => {
        hexo.exit();
        return res.json({'code':Status.HEXO_CREATED});
      });
    })
    .catch((err) => {
      console.error(err);
      hexo.exit();
      return res.status(500).json({'code': Status.HEXO_FAILED_TO_CREATE});
    });
});

// Export
module.exports = router;