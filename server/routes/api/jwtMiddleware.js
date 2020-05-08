// Dependencies
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const secret = req.app.get('config').jwt_secret;
  const header = req.header('Authorization');
  if (!header)
    return res.status(401).json({'msg': 'Not authorized.'});
  try {
    const [schema, token] = header.split(' ');
    if (schema != 'Bearer')
      return res.status(401).json({'msg': 'Wrong authorization schema.'});
    else
    {
      jwt.verify(token, secret, (err, decoded) => {
        if (err)
          return res.status(401).json({'msg': 'Not authorized.'});
        else
          next();
      });
    }
  } catch (e) {
    return res.status(401).json({'msg': 'Not authorized.'});
  }
}