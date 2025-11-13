const bcrypt = require('bcryptjs');
const db = require('../db');

function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      (err, row) => (err ? reject(err) : resolve(row || null))
    );
  });
}

function registerUser(email, password) {
  return new Promise(async (resolve, reject) => {
    const existing = await findUserByEmail(email);
    if (existing) {
      const error = new Error('Email ya registrado');
      error.code = 'EMAIL_EXISTS';
      return reject(error);
    }

    const hash = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
      [email, hash],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, email });
      }
    );
  });
}

function authenticateUser(email, password) {
  return new Promise(async (resolve, reject) => {
    const user = await findUserByEmail(email);
    if (!user) {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID';
      return reject(error);
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID';
      return reject(error);
    }

    resolve({ id: user.id, email: user.email });
  });
}

module.exports = {
  findUserByEmail,
  registerUser,
  authenticateUser,
};
