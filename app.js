const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

// Inicializa DB (side-effect)
require('./db');

const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const remoteRoutes = require('./routes/remoteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear body
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de sesión – IMPORTANTE que vaya ANTES de las rutas
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Rutas (ya reciben req.session inicializado)
app.use('/', authRoutes);
app.use('/', notesRoutes);
app.use('/', remoteRoutes);

// Arrancar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App escuchando en http://0.0.0.0:${PORT}`);
});
