const db = require('../db');

// Todas las funciones reciben userId para aplicar el scope

function getAllNotes(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, title, substr(content, 1, 150) AS snippet, created_at
       FROM notes
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function getNoteById(id, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, user_id, title, content, created_at
       FROM notes
       WHERE id = ? AND user_id = ?`,
      [id, userId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

function createNote(userId, title, content) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)`,
      [userId, title, content],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

function updateNote(id, userId, title, content) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE notes
       SET title = ?, content = ?
       WHERE id = ? AND user_id = ?`,
      [title, content, id, userId],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes); // 0 si no existe o no pertenece al user
      }
    );
  });
}

function deleteNote(id, userId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM notes WHERE id = ? AND user_id = ?`,
      [id, userId],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
}

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
