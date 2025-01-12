const express = require('express');
const path = require('path');
const passport = require('passport');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/home', (req, res) => {
  res.render('home');
});


router.get('/user', (req, res) => {
  res.render('perfilUsuario', { user: req.user });
});

router.get(
  '/user',
  passport.authenticate('current', { session: false }), 
  (req, res) => {
    res.render('perfilUsuario', { datosUsuario: req.user });
  }
);

module.exports = router;