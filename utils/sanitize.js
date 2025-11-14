// utils/sanitize.js
const sanitizeHtml = require('sanitize-html');

function sanitizeNoteHtml(html) {
  return sanitizeHtml(html || '', {
    allowedTags: [
      'h1', 'h2', 'h3',
      'p', 'b', 'i', 'em', 'strong', 'u',
      'ul', 'ol', 'li',
      'br', 'span', 'div',
      'a',
      // SSRF demo tags
      'img',
      'iframe',
      'object'
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target'],
      img: ['src', 'alt', 'width', 'height'],
      iframe: ['src', 'width', 'height', 'frameborder'],
      object: ['data', 'type', 'width', 'height'],
      span: ['style'],
      div: ['style'],
      p: ['style']
    },
    allowedSchemes: ['http', 'https'],
    // allow localhost / metadata / internal for SSRF PoC
    allowProtocolRelative: false
  });
}

module.exports = { sanitizeNoteHtml };
