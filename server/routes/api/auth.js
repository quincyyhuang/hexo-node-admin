// Dependencies
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Routes
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

// Export
module.exports = router;