const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middlewares/auth');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'your_default_secret';

router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
router.post('/login', passport.authenticate('login', { session: false }), (req, res) => {
  const user = req.user;
  const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });
  res.cookie('jwt', token, { httpOnly: true });
  res.send({ message: 'Login successful', token });
});

router.get(
  '/user',
  passport.authenticate('current', { session: false }), 
  (req, res) => {
    res.status(200).json({
      mensaje: 'Perfil usuario',
      datosUsuario: req.user,
    });
  }
);

module.exports = router;
