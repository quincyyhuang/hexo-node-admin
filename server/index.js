// Dependencies
const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('./routes/api/auth');
const hexo = require('./routes/api/hexo');

// Global variables
const app = express();

// Settings
try {
  var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  app.set('port', (config.port || 4001));
  app.set('config', config);
} catch (e) {
  console.log('Bad config file.');
  process.exit();
}

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

// Server
app.listen(app.get('port'), () => {
	console.log(`Hexo admin is running on port ${app.get('port')}. Entry point is ${config.root}.`);
});