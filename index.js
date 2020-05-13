// Dependencies
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');
const auth = require('./routes/api/auth');
const hexo = require('./routes/api/hexo');

// Global variables
const app = express();

// Settings
try {
  var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  app.set('port', (config.port || 4001));
  app.set('host', (config.host || 'localhost'));
  config.deploy.type = config.deploy.type || 'default';
  // Get hexo root dir right
  if (!path.isAbsolute(config.hexo_dir))
    config.hexo_dir = path.normalize(path.resolve(__dirname, config.hexo_dir));
  // Create random jwt_secret if not set
  config.jwt_secret = config.jwt_secret || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  // Check if blog exists
  const yamlFp = path.resolve(config.hexo_dir, '_config.yml');
  if (!fs.existsSync(yamlFp)) {
    console.error('Hexo config file does not exist. Please check if hexo_dir is set correctly.');
    process.exit();
  }
  else {
    try {
      var yamlConfig = fs.readFileSync(yamlFp, 'utf8');
      yamlConfig = yaml.safeLoad(yamlConfig);
      config.yaml = yamlConfig;
    } catch (e) {
      console.error('Cannot open Hexo config file.');
      process.exit();
    }
  }
  // Set app-wise config
  app.set('config', config);
} catch (e) {
  console.error('Bad config file.');
  process.exit();
}

// Setup local environment for front end
console.log('Setting up the config for front end...');
const envPath = path.resolve(__dirname, '.env.local');
try {
  const ENV = `REACT_APP_ROOT=${config.root}\nREACT_APP_LANG=${config.lang}`;
  fs.writeFileSync(envPath, ENV, 'utf8');
}
catch (e) {
  console.error('Failed to setup front end.');
  console.error(e);
  process.exit();
}
console.log('Finished!');

// Build front end from config
if (!process.env.DEBUG_API)
{
  console.log('Building front end from config...');
  try {
    let result = execSync('npm run build', { cwd: path.resolve(__dirname), windowsHide: true, encoding: 'utf8' });
    console.log(result);
  }
  catch (e) {
    console.error('Failed to build front end.');
    console.error(e);
    process.exit();
  }
  console.log('Finished!');
}
else
  console.log('Skipped building front end.');

// Check if request body has error
function JSONCheck(err, req, res, next) {
  if (err) {
    console.error(err);
    return res.sendStatus(400);
  }
  else
    next();
}

app.use(path.posix.resolve(config.root || '/', 'api', 'auth'), express.json({ strict: false }), JSONCheck, auth); // strict = false to make it accept plain string as valid JSON
app.use(path.posix.resolve(config.root || '/', 'api', 'hexo'), express.json({ strict: false }), JSONCheck, hexo);

// Serve front end
if (!process.env.DEBUG_API)
{
  app.use(express.static(path.join(__dirname, 'build')));
  app.use('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Server
app.listen(app.get('port'), app.get('host'), () => {
	console.log(`Hexo Node Admin is running on port ${app.get('port')}. Entry point is ${config.root}.`);
});