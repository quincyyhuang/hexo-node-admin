// Dependencies
const jwt = require('jsonwebtoken');
const Status = require('./status');

module.exports = (req, res, next) => {
  const secret = req.app.get('config').jwt_secret;
  const header = req.header('Authorization');
  if (!header)
    return res.status(401).json({'code': Status.AUTH_BAD_CREDENTIALS});
  try {
    const [schema, token] = header.split(' ');
    if (schema !== 'Bearer')
      return res.status(401).json({'code': Status.AUTH_BAD_HEADERS});
    else
    {
      jwt.verify(token, secret, (err, decoded) => {
        if (err)
          return res.status(401).json({'code': Status.AUTH_BAD_CREDENTIALS});
        else
          next();
      });
    }
  } catch (e) {
    return res.status(401).json({'code': Status.AUTH_BAD_CREDENTIALS});
  }
}