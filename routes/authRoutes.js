const express = require('express');
const router = express.Router();

const authService = require('../services/authService');
const { layout, escapeHtml } = require('../utils/view');

function getCurrentUser(req) {
  return req.session && req.session.user ? req.session.user : null;
}

/* REGISTER */
router.get('/register', (req, res) => {
  const user = getCurrentUser(req);
  if (user) return res.redirect('/');

  res.send(
    layout(
      'Register',
      `
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card">
            <div class="card-body">
              <h2 class="h4 mb-3">create cuenta</h2>
              <form action="/register" method="POST">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" name="email" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" name="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-2">Sign up</button>
                <p class="mb-0 text-center">
                  Already have an account? <a href="/login">Log in</a>
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
    let msg = 'Error while registering';
    if (err.code === 'EMAIL_EXISTS') msg = 'That email is already registered';

    res.send(
      layout(
        'Register',
        `
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="card">
              <div class="card-body">
                <h2 class="h4 mb-3">create cuenta</h2>
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
                  <button type="submit" class="btn btn-primary w-100 mb-2">Sign up</button>
                  <p class="mb-0 text-center">
                    Already have an account? <a href="/login">Log in</a>
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
              <h2 class="h4 mb-3">Log in</h2>
              <form action="/login" method="POST">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" name="email" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" name="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-2">Log in</button>
                <p class="mb-0 text-center">
                  Don't have an account? <a href="/register">Sign up</a>
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
                <h2 class="h4 mb-3">Log in</h2>
                <p class="text-danger">Incorrect email or password</p>
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
                  <button type="submit" class="btn btn-primary w-100 mb-2">Log in</button>
                  <p class="mb-0 text-center">
                    Don't have an account? <a href="/register">Sign up</a>
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
