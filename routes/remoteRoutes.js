const express = require('express');
const router = express.Router();

const { layout, escapeHtml } = require('../utils/view');
const { fetchRemoteUrl } = require('../services/remoteService');

function getCurrentUser(req) {
  return req.session && req.session.user ? req.session.user : null;
}

// Form SSRF demo
router.get('/remote', (req, res) => {
  const user = getCurrentUser(req);

  res.send(
    layout(
      'Remote fetch demo',
      `
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card">
            <div class="card-body">
              <h2 class="h4 mb-3">Remote Fetch (Demo SSRF)</h2>
              <p class="text-muted">
                This form makes an HTTP request from <strong>the server</strong> to the URL you provide.
              </p>
              <form action="/remote/fetch" method="GET">
                <div class="mb-3">
                  <label class="form-label">URL a pedir desde el servidor</label>
                  <input type="text" name="url" class="form-control"
                    placeholder="http://example.com" required>
                </div>
                <button type="submit" class="btn btn-primary">Send request from server</button>
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

// SSRF result demo
router.get('/remote/fetch', async (req, res) => {
  const user = getCurrentUser(req);
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.redirect('/remote');
  }

  try {
    const { status, statusText, contentType, body } =
      await fetchRemoteUrl(targetUrl);

    res.send(
      layout(
        'Resultado Remote Fetch',
        `
        <div class="row">
          <div class="col-lg-10">
            <div class="card mb-3">
              <div class="card-body">
                <h2 class="h4 mb-3">Result of the server-side request</h2>
                <dl class="row small">
                  <dt class="col-sm-2">URL</dt>
                  <dd class="col-sm-10">${escapeHtml(targetUrl)}</dd>

                  <dt class="col-sm-2">Status</dt>
                  <dd class="col-sm-10">${status} ${escapeHtml(statusText)}</dd>

                  <dt class="col-sm-2">Content-Type</dt>
                  <dd class="col-sm-10">${escapeHtml(contentType)}</dd>
                </dl>

                <h5 class="mt-3">Body (first 4000 characters)</h5>
                <pre class="bg-light border rounded p-3" style="white-space: pre-wrap; max-height: 400px; overflow:auto;">
${escapeHtml(body)}
                </pre>

                <a href="/remote" class="btn btn-outline-secondary btn-sm mt-2">Probar otra URL</a>
              </div>
            </div>
          </div>
        </div>
        `,
        user
      )
    );
  } catch (err) {
    res.send(
      layout(
        'Error Remote Fetch',
        `
        <div class="row">
          <div class="col-lg-8">
            <div class="card border-danger">
              <div class="card-body">
                <h2 class="h4 text-danger mb-3">Error while making the request</h2>
                <p><strong>URL:</strong> ${escapeHtml(targetUrl)}</p>
                <pre class="bg-light border rounded p-3" style="white-space: pre-wrap;">
${escapeHtml(err.message)}
                </pre>
                <a href="/remote" class="btn btn-outline-secondary btn-sm mt-2">Back</a>
              </div>
            </div>
          </div>
        </div>
        `,
        user
      )
    );
  }
});

module.exports = router;
