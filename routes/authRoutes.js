const express = require('express');
const router = express.Router();

const authService = require('../services/authService');
const { layout, escapeHtml } = require('../utils/view');

function getCurrentUser(req) {
  return req.session && req.session.user ? req.session.user : null;
}

/* REGISTRO */
router.get('/register', (req, res) => {
  const user = getCurrentUser(req);
  if (user) return res.redirect('/');

  res.send(
    layout(
      'Registro',
      `
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card">
            <div class="card-body">
              <h2 class="h4 mb-3">Crear cuenta</h2>
              <form action="/register" method="POST">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" name="email" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" name="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-2">Registrarme</button>
                <p class="mb-0 text-center">
                  ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      `,
      user
    )
  );
});

router.post('/register', async (req, res) => {
  const user = getCurrentUser(req);
  if (user) return res.redirect('/');

  const { email, password } = req.body;

  try {
    const newUser = await authService.registerUser(email, password);
    req.session.user = { id: newUser.id, email: newUser.email };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    let msg = 'Error al registrarse';
    if (err.code === 'EMAIL_EXISTS') msg = 'Ese email ya está registrado';

    res.send(
      layout(
        'Registro',
        `
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="card">
              <div class="card-body">
                <h2 class="h4 mb-3">Crear cuenta</h2>
                <p class="text-danger">${escapeHtml(msg)}</p>
                <form action="/register" method="POST">
                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" class="form-control"
                      value="${escapeHtml(email || '')}" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" name="password" class="form-control" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100 mb-2">Registrarme</button>
                  <p class="mb-0 text-center">
                    ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
        `,
        null
      )
    );
  }
});

/* LOGIN */
router.get('/login', (req, res) => {
  const user = getCurrentUser(req);
  if (user) return res.redirect('/');

  res.send(
    layout(
      'Login',
      `
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card">
            <div class="card-body">
              <h2 class="h4 mb-3">Iniciar sesión</h2>
              <form action="/login" method="POST">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" name="email" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" name="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-2">Entrar</button>
                <p class="mb-0 text-center">
                  ¿No tienes cuenta? <a href="/register">Regístrate</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      `,
      user
    )
  );
});

router.post('/login', async (req, res) => {
  const user = getCurrentUser(req);
  if (user) return res.redirect('/');

  const { email, password } = req.body;

  try {
    const u = await authService.authenticateUser(email, password);
    req.session.user = { id: u.id, email: u.email };
    res.redirect('/');
  } catch (err) {
    console.error(err);

    res.send(
      layout(
        'Login',
        `
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="card">
              <div class="card-body">
                <h2 class="h4 mb-3">Iniciar sesión</h2>
                <p class="text-danger">Email o contraseña incorrectos</p>
                <form action="/login" method="POST">
                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" class="form-control"
                      value="${escapeHtml(email || '')}" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" name="password" class="form-control" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100 mb-2">Entrar</button>
                  <p class="mb-0 text-center">
                    ¿No tienes cuenta? <a href="/register">Regístrate</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
        `,
        null
      )
    );
  }
});

/* LOGOUT */
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
