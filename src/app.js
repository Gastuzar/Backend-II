const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const { iniciarPassport } = require('./config/passport');
const sessionRoutes = require('./routes/sessions');
const cookieParser = require('cookie-parser');
const path = require('path');
const { engine } = require('express-handlebars');
const bcrypt = require('bcrypt');
const auth = require('./middlewares/auth');
const User = require('./models/user');
const { jwtSecret } = require('./utils');





const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
iniciarPassport();
app.use(passport.initialize());


app.use('/api/sessions', sessionRoutes);
app.use('/', require('./routes/views.router'));


mongoose.connect('mongodb+srv://gastonzarate25:323283Gz@cluster0.6rk5z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
}).then(() =>{ console.log('MongoDB connected')

}).catch(error => console.log("La conexion a la base de datos fallo", error));

app.engine('handlebars', engine({
  defaultLayout: 'main', 
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views'), 
}));

app.set('view engine', 'handlebars');

app.set('views', path.join(__dirname,  'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



app.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  if (!first_name || !last_name || !email || !age || !password) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ error: "El correo electrónico ya existe" });
  }

  try {
    const newUser = new User({ first_name, last_name, email, age, password: hashedPassword });
    await newUser.save(); 
    res.status(201).json({ message: "Usuario registrado exitosamente" });
    res.redirect('/login');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get(
  '/user',
  passport.authenticate('current', { session: false }), 
  (req, res) => {
    res.status(200).json({
      mensaje: 'Perfil usuario',
      datosUsuario: req.user, 
      
    });
  }
);


app.post('/login', async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!email || !password) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret);
    res.cookie('jwt', token, { httpOnly: true });
    res.status(200).json({ message: "Login exitoso", token });
    res.redirect('/user');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.send(`
    <h1>Has cerrado sesión correctamente</h1>
    <p>Serás redirigido a la página de inicio en 3 segundos...</p>
    <script>
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    </script>
  ` );
  res.redirect('/home');
});

