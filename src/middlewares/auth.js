const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/passport');

const auth = (req, res, next) => {
  if (!req.cookies || !req.cookies.jwt) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ error: 'No hay usuarios autenticados' });
  }

  const token = req.cookies.jwt; 

  try {
    const user = jwt.verify(token, jwtSecret);
    req.user = user; 
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({ error: error.message });
  }

  next(); 
};

module.exports = auth;
