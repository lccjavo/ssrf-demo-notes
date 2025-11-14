function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(pageTitle, bodyHtml, user) {
  const authSection = user
    ? `
      <span class="me-2">Hi, ${escapeHtml(user.email)}</span>
      <form action="/logout" method="POST" class="d-inline">
        <button type="submit" class="btn btn-outline-light btn-sm">Logout</button>
      </form>
    `
    : `
      <a href="/login" class="btn btn-outline-light btn-sm me-2">Login</a>
      <a href="/register" class="btn btn-warning btn-sm">Register</a>
    `;

  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${pageTitle}</title>

      <!-- Bootstrap CSS -->
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossorigin="anonymous"
      >

      <!-- TinyMCE (CDN, no API key needed for demo) -->
      <script
        src="https://cdn.jsdelivr.net/npm/tinymce@6.8.3/tinymce.min.js"
        referrerpolicy="origin"
      ></script>

      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .note-list-item p {
          margin-bottom: 0.4rem;
        }
        textarea {
          font-family: monospace;
        }
      </style>
    </head>
    <body class="bg-light">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="/">Demo Notes</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" href="/">Notes</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/notes/new">New note</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/remote">Remote fetch (SSRF demo)</a>
              </li>
            </ul>
            <div class="d-flex align-items-center">
              ${authSection}
            </div>
          </div>
        </div>
      </nav>

      <main class="container my-4">
        ${bodyHtml}
      </main>

      <!-- Bootstrap JS bundle -->
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"
      ></script>

      <!-- TinyMCE init (only if there is a textarea.rich-editor on the page) -->
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          if (document.querySelector('textarea.rich-editor')) {
            tinymce.init({
              selector: 'textarea.rich-editor',
              menubar: false,
              plugins: 'lists link code',
              toolbar:
                'undo redo | formatselect | ' +
                'bold italic underline | bullist numlist | link | code',
              branding: false,
              height: 350,
              convert_urls: false
            });
          }
        });
      </script>
    </body>
  </html>
  `;
}

module.exports = {
  layout,
  escapeHtml,
};
