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

// Middleware to parse body
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware – IMPORTANT: must be BEFORE the routes
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Routes (req.session is already initialized)
app.use('/', authRoutes);
app.use('/', notesRoutes);
app.use('/', remoteRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${PORT}`);
});
