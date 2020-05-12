// Dependencies
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
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
  app.set('config', config);
  // Create random jwt_secret if not set
  config.jwt_secret = config.jwt_secret || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} catch (e) {
  console.log('Bad config file.');
  process.exit();
}

// Setup local environment for front end
console.log('Setting up the config for front end...');
const envPath = path.resolve(__dirname, '../client/.env.local');
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
console.log('Building front end from config...');
try {
  let result = execSync('npm run build', { cwd: path.resolve(__dirname, '../client'), windowsHide: true, encoding: 'utf8' });
  console.log(result);
  // Copy (overwrite) build from client to server
  fs.copySync(path.resolve(__dirname, '../client/build'), path.resolve(__dirname, 'build'));
}
catch (e) {
  console.log('Failed to build front end.');
  console.error(e);
  process.exit();
}
console.log('Finished!');

app.use(express.json({ strict: false }));   // In order to accept JSON body that is only a string.
app.use((err, req, res, next) => {
  if (err) {
    console.log(err);
    return res.status(400).json({'msg': 'Bad request.'});
  }
  else
    next();
});

app.use(path.resolve(config.root || '/', 'api', 'auth'), auth);
app.use(path.resolve(config.root || '/', 'api', 'hexo'), hexo);

// Serve front end
app.use(express.static(path.join(__dirname, 'build')));
app.use('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Server
app.listen(app.get('port'), app.get('host'), () => {
	console.log(`Hexo Node Admin is running on port ${app.get('port')}. Entry point is ${config.root}.`);
});