// Dependencies
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Routes
/*
@method  POST
@path    '/login'
@access  Public
@desc    Return valid jwt token.
*/
router.post('/login', (req, res) => {
  const config = req.app.get('config');
  const { username, password } = config.admin;
  const { u, p } = req.body;
  if (!u || !p) {
    return res.status(400).json({'msg': 'Please enter both username and password.'});
  }
  else {
    if (u == username && p == password) {
      // Authenticated
      jwt.sign(
        { u },
        config.jwt_secret,
        {
          expiresIn: '1d'
        },
        (err, token) => {
          if (err)
            return res.status(500).json({'msg': 'Internal authentication error.'});
          else
            return res.json({ token });
        }
      );
    }
    else
      return res.status(401).json({'msg': 'Bad credentials.'});
  }
});

/*
@method  GET
@path    '/refresh'
@access  Public
@desc    Refresh token.
*/
router.get('/refresh', (req, res) => {
  const header = req.header('Authorization');
  if (!header)
    return res.status(401).json({'msg': 'Invalid authorization header.'});
  const [schema, token] = header.split(' ');
  if (schema != 'Bearer')
    return res.status(401).json({'msg': 'Invalid authorization schema'});
  const secret = req.app.get('config').jwt_secret;
  jwt.verify(token, secret, (err, decoded) => {
    if (err)
      return res.status(401).json({'msg': 'Not authorized.'});
    else
    {
      jwt.sign(decoded, secret, {
        expiresIn: '1d'
      }, (err, token) => {
        if (err)
          return res.status(500).json({'msg': 'Internal authentication error.'});
        else
          return res.json({ token });
      });
    }
  });
});

// Export
module.exports = router;