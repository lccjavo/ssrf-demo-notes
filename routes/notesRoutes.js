const express = require('express');
const router = express.Router();

const noteService = require('../services/noteService');
const { createNotePdf } = require('../services/pdfService');
const { layout, escapeHtml } = require('../utils/view');
const { sanitizeNoteHtml } = require('../utils/sanitize');

// Helpers de auth
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
   LISTADO DE NOTAS (solo del usuario actual)
============================================================================ */
router.get('/', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  try {
    const rows = await noteService.getAllNotes(user.id);

    const listHtml = rows
      .map((note) => {
        const safeSnippet = sanitizeNoteHtml(note.snippet || '');

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
                ${safeSnippet || '<span class="text-muted">(sin contenido)</span>'}
              </div>
              <div class="mt-2 d-flex flex-wrap gap-2">
                <a href="/notes/${note.id}/edit" class="btn btn-sm btn-primary">Editar</a>
                <form action="/notes/${note.id}/delete" method="POST" onsubmit="return confirm('¿Eliminar nota?');">
                  <button type="submit" class="btn btn-sm btn-danger">Eliminar</button>
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
        'Notas',
        `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h4 mb-0">Tus notas</h2>
          <a href="/notes/new" class="btn btn-success">Nueva nota</a>
        </div>
        ${listHtml || '<p class="text-muted">No hay notas todavía.</p>'}
        `,
        user
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al leer notas');
  }
});


/* ============================================================================
   NUEVA NOTA
============================================================================ */
router.get('/notes/new', requireAuth, (req, res) => {
  const user = getCurrentUser(req);

  res.send(
    layout(
      'Nueva nota',
      `
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card">
            <div class="card-body">
              <h2 class="h4 mb-3">Nueva nota</h2>
              <form action="/notes" method="POST">
                <div class="mb-3">
                  <label class="form-label">Título</label>
                  <input type="text" name="title" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">
                    Contenido <small class="text-muted">(HTML permitido limitado)</small>
                  </label>
                  <textarea
                    name="content"
                    class="form-control rich-editor"
                    rows="8"
                    placeholder="<h1>Título</h1><p>Texto...</p>"
                  ></textarea>
                </div>
                <div class="d-flex justify-content-between">
                  <a href="/" class="btn btn-outline-secondary">Cancelar</a>
                  <button type="submit" class="btn btn-primary">Guardar</button>
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
   CREAR NOTA
============================================================================ */
router.post('/notes', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { title, content } = req.body;

  try {
    const id = await noteService.createNote(user.id, title, content);
    res.redirect(`/notes/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al guardar nota');
  }
});

/* ============================================================================
   VER NOTA (solo si pertenece al usuario)
============================================================================ */
router.get('/notes/:id', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { id } = req.params;

  try {
    const note = await noteService.getNoteById(id, user.id);
    if (!note) return res.status(404).send('Nota no encontrada');

    const safeContent = sanitizeNoteHtml(note.content || '');

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
                  ${safeContent || '<em class="text-muted">(sin contenido)</em>'}
                </div>
                <div class="mt-3 d-flex flex-wrap gap-2">
                  <a href="/notes/${note.id}/edit" class="btn btn-primary btn-sm">Editar</a>
                  <a href="/notes/${note.id}/pdf" target="_blank" class="btn btn-outline-secondary btn-sm">
                    Descargar PDF
                  </a>
                  <a href="/" class="btn btn-link btn-sm">Volver al listado</a>
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
    res.status(500).send('Error al leer nota');
  }
});

/* ============================================================================
   FORMULARIO EDITAR NOTA
============================================================================ */
router.get('/notes/:id/edit', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { id } = req.params;

  try {
    const note = await noteService.getNoteById(id, user.id);
    if (!note) return res.status(404).send('Nota no encontrada');

    res.send(
      layout(
        `Editar: ${escapeHtml(note.title)}`,
        `
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card">
              <div class="card-body">
                <h2 class="h4 mb-3">Editar nota</h2>
                <form action="/notes/${note.id}/update" method="POST">
                  <div class="mb-3">
                    <label class="form-label">Título</label>
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
                      Contenido <small class="text-muted">(HTML permitido limitado)</small>
                    </label>
                    <textarea
                      name="content"
                      class="form-control rich-editor"
                      rows="8"
                    >${escapeHtml(note.content || '')}</textarea>
                  </div>
                  <div class="d-flex justify-content-between">
                    <a href="/notes/${note.id}" class="btn btn-outline-secondary">Cancelar</a>
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
    res.status(500).send('Error al cargar nota para edición');
  }
});

/* ============================================================================
   ACTUALIZAR NOTA
============================================================================ */
router.post('/notes/:id/update', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const changes = await noteService.updateNote(id, user.id, title, content);
    if (!changes) return res.status(404).send('Nota no encontrada');

    res.redirect(`/notes/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar nota');
  }
});

/* ============================================================================
   ELIMINAR NOTA
============================================================================ */
router.post('/notes/:id/delete', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { id } = req.params;

  try {
    await noteService.deleteNote(id, user.id);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar nota');
  }
});

/* ============================================================================
   PDF (solo si pertenece al usuario)
============================================================================ */
router.get('/notes/:id/pdf', requireAuth, async (req, res) => {
  const user = getCurrentUser(req);
  const { id } = req.params;

  try {
    const note = await noteService.getNoteById(id, user.id);
    if (!note) return res.status(404).send('Nota no encontrada');

    const { doc, filename } = createNotePdf(note);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al generar PDF');
  }
});

module.exports = router;
