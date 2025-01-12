const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { jwtSecret } = require('../utils');

const buscaToken = (req) => {
  let token = null;

  if (req.cookies?.cookietoken) {
    token = req.cookies.cookietoken;
  }
  if (!token && req.headers?.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  return token;
};


const iniciarPassport = () => {
  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'Usuario no encontrado' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Credenciales inválidas' });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.use(new JwtStrategy({
    secretOrKey: jwtSecret,
    jwtFromRequest: ExtractJwt.fromExtractors([buscaToken]),
  }, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (!user) return done(null, false, { message: 'User not found' });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
};

module.exports = { iniciarPassport };


