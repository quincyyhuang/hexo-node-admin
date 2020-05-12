// Dependencies
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Status = require('./status');

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
    return res.status(400).json({'code': Status.AUTH_MISSING_CREDENTIALS});
  }
  else {
    if (config.admin.plain == true)
    {
      // Plain text password
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
              return res.status(500).json({'code': Status.AUTH_INTERNAL_ERROR});
            else
              return res.json({ token });
          }
        );
      }
      else
        return res.status(401).json({'code': Status.AUTH_BAD_CREDENTIALS});
    }
    else
    {
      if (u == username)
      {
        bcrypt.compare(p, password, (err, result) => {
          if (err)
            return res.status(500).json({'code': Status.AUTH_INTERNAL_ERROR});
          else
          {
            if (result)
              // Authenticated
              jwt.sign(
                { u },
                config.jwt_secret,
                {
                  expiresIn: '1d'
                },
                (err, token) => {
                  if (err)
                    return res.status(500).json({'code': Status.AUTH_INTERNAL_ERROR});
                  else
                    return res.json({ token });
                }
              );
            else
              return res.status(401).json({'code': Status.AUTH_BAD_CREDENTIALS});
          }
        })
      }
      else
        return res.status(401).json({'code': Status.AUTH_BAD_CREDENTIALS});
    }
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
    return res.status(401).json({'code': Status.AUTH_BAD_HEADERS});
  const [schema, token] = header.split(' ');
  if (schema != 'Bearer')
    return res.status(401).json({'code': Status.AUTH_BAD_HEADERS});
  const secret = req.app.get('config').jwt_secret;
  jwt.verify(token, secret, (err, decoded) => {
    if (err)
      return res.status(401).json({'code': Status.AUTH_BAD_CREDENTIALS});
    else
    {
      jwt.sign(decoded, secret, {
        expiresIn: '1d'
      }, (err, token) => {
        if (err)
          return res.status(500).json({'code': Status.AUTH_INTERNAL_ERROR});
        else
          return res.json({ token });
      });
    }
  });
});

// Export
module.exports = router;