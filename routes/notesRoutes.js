const express = require('express');
const router = express.Router();

const noteService = require('../services/noteService');
const { createNotePdf } = require('../services/pdfService');
const { layout, escapeHtml } = require('../utils/view');
const { sanitizeNoteHtml } = require('../utils/sanitize');
const puppeteer = require('puppeteer');
const { generatePdfWithChromium } = require('../services/chromiumPdfService');

// Auth helpers
function getCurrentUser(req) {
  return req.session && req.session.user ? req.session.user : null;
}

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
}

/* ============================================================================
   LISTADO DE notes (solo del user actual)
============================================================================ */
router.get('/', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  try {
    const rows = await noteService.getAllNotes(user.id);

    const listHtml = rows
      .map((note) => {
        //const safeSnippet = sanitizeNoteHtml(note.snippet || '');
        const safeSnippet = note.snippet

        return `
          <div class="card mb-3 note-list-item">
            <div class="card-body">
              <h5 class="card-title mb-1">
                <a href="/notes/${note.id}" class="link-dark text-decoration-none">
                  ${escapeHtml(note.title)}
                </a>
              </h5>
              <small class="text-muted d-block mb-2">
                ${escapeHtml(note.created_at)}
              </small>
              <div class="card-text">
                ${safeSnippet || '<span class="text-muted">(sin content)</span>'}
              </div>
              <div class="mt-2 d-flex flex-wrap gap-2">
                <a href="/notes/${note.id}/edit" class="btn btn-sm btn-primary">edit</a>
                <form action="/notes/${note.id}/delete" method="POST" onsubmit="return confirm('Delete note?');">
                  <button type="submit" class="btn btn-sm btn-danger">delete</button>
                </form>
                <a href="/notes/${note.id}/pdf" target="_blank" class="btn btn-sm btn-outline-secondary">
                  PDF
                </a>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    res.send(
      layout(
        'notes',
        `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h4 mb-0">Your notes</h2>
          <a href="/notes/new" class="btn btn-success">New note</a>
        </div>
        ${listHtml || '<p class="text-muted">No notes yet.</p>'}
        `,
        user
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading notes');
  }
});


/* ============================================================================
   NUEVA note
============================================================================ */
router.get('/notes/new', requireAuth, (req, res) => {
  const user = getCurrentUser(req);

  res.send(
    layout(
      'Nueva note',
      `
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card">
            <div class="card-body">
              <h2 class="h4 mb-3">Nueva note</h2>
              <form action="/notes" method="POST">
                <div class="mb-3">
                  <label class="form-label">Title</label>
                  <input type="text" name="title" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">
                    Content <small class="text-muted">(Limited allowed HTML)</small>
                  </label>
                  <textarea
                    name="content"
                    class="form-control rich-editor"
                    rows="8"
                    placeholder="<h1>Title</h1><p>Text...</p>"
                  ></textarea>
                </div>
                <div class="d-flex justify-content-between">
                  <a href="/" class="btn btn-outline-secondary">cancel</a>
                  <button type="submit" class="btn btn-primary">Save</button>
                </div>
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

/* ============================================================================
   create note
============================================================================ */
router.post('/notes', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { title, content } = req.body;

  try {
    const id = await noteService.createNote(user.id, title, content);
    res.redirect(`/notes/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al save note');
  }
});

/* ============================================================================
   VER note (solo si pertenece al user)
============================================================================ */
router.get('/notes/:id', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { id } = req.params;

  try {
    const note = await noteService.getNoteById(id, user.id);
    if (!note) return res.status(404).send('Note not found');

    //const safeContent = sanitizeNoteHtml(note.content || '');
    const safeContent = note.content
    
    res.send(
      layout(
        escapeHtml(note.title),
        `
        <div class="row justify-content-center">
          <div class="col-md-10 col-lg-8">
            <div class="card mb-3">
              <div class="card-body">
                <h2 class="h4">${escapeHtml(note.title)}</h2>
                <small class="text-muted d-block mb-3">
                  Creada: ${escapeHtml(note.created_at)}
                </small>
                <div class="border rounded p-3 bg-white">
                  ${safeContent || '<em class="text-muted">(sin content)</em>'}
                </div>
                <div class="mt-3 d-flex flex-wrap gap-2">
                  <a href="/notes/${note.id}/edit" class="btn btn-primary btn-sm">edit</a>
                  <a href="/notes/${note.id}/pdf" target="_blank" class="btn btn-outline-secondary btn-sm">
                    download PDF
                  </a>
                  <a href="/" class="btn btn-link btn-sm">back al listado</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        `,
        user
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al leer note');
  }
});

/* ============================================================================
   FORMULARIO edit note
============================================================================ */
router.get('/notes/:id/edit', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { id } = req.params;

  try {
    const note = await noteService.getNoteById(id, user.id);
    if (!note) return res.status(404).send('Note not found');

    res.send(
      layout(
        `edit: ${escapeHtml(note.title)}`,
        `
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card">
              <div class="card-body">
                <h2 class="h4 mb-3">edit note</h2>
                <form action="/notes/${note.id}/update" method="POST">
                  <div class="mb-3">
                    <label class="form-label">Title</label>
                    <input
                      type="text"
                      name="title"
                      class="form-control"
                      value="${escapeHtml(note.title)}"
                      required
                    >
                  </div>
                  <div class="mb-3">
                    <label class="form-label">
                      Content <small class="text-muted">(Limited allowed HTML)</small>
                    </label>
                    <textarea
                      name="content"
                      class="form-control rich-editor"
                      rows="8"
                    >${escapeHtml(note.content || '')}</textarea>
                  </div>
                  <div class="d-flex justify-content-between">
                    <a href="/notes/${note.id}" class="btn btn-outline-secondary">cancel</a>
                    <button type="submit" class="btn btn-primary">Actualizar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        `,
        user
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading note for editing');
  }
});

/* ============================================================================
   ACTUALIZAR note
============================================================================ */
router.post('/notes/:id/update', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const changes = await noteService.updateNote(id, user.id, title, content);
    if (!changes) return res.status(404).send('Note not found');

    res.redirect(`/notes/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating note');
  }
});

/* ============================================================================
   delete note
============================================================================ */
router.post('/notes/:id/delete', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { id } = req.params;

  try {
    await noteService.deleteNote(id, user.id);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting note');
  }
});

/* ============================================================================
   PDF (solo si pertenece al user)
============================================================================ */


router.get('/notes/:id/pdf', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { id } = req.params;

  try {
    const note = await noteService.getNoteById(id, user.id);
    if (!note) {
      return res.status(404).send('Note not found');
    }

    // Para PoC vulnerable podras usar note.content tal cual:
    const contentHtml = note.content || '';

    // o si quieres que coincida con la vista:
    // const contentHtml = sanitizeNoteHtml
    //   ? sanitizeNoteHtml(note.content || '')
    //   : (note.content || '');

    const fullHtml = `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>${escapeHtml(note.title || 'note')}</title>
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
            rel="stylesheet"
          >
        </head>
        <body class="p-4">
          <div class="container">
            <h1 class="mb-2">${escapeHtml(note.title || 'note')}</h1>
            <p class="text-muted" style="font-size: 12px;">
              Creada: ${escapeHtml(note.created_at || '')}
            </p>
            <hr />
            <div class="mt-3">
              ${contentHtml}
            </div>
          </div>
        </body>
      </html>
    `;

    const pdfBuffer = await generatePdfWithChromium(fullHtml);

    const safeFilename =
      (note.title || 'note')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'note';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFilename}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Very important: send the buffer as-is, with no extra content
    res.end(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF with Chromium:', err);
    // If something goes wrong, send a 500 with plain text (not PDF)
    if (!res.headersSent) {
      res.status(500).send('Error generating PDF');
    }
  }
});

module.exports = router;
