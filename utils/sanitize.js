const sanitizeHtml = require('sanitize-html');

function sanitizeNoteHtml(html) {
  return sanitizeHtml(html || '', {
    allowedTags: [
      'h1', 'h2', 'h3',
      'p', 'b', 'i', 'em', 'strong', 'u',
      'ul', 'ol', 'li',
      'br', 'span', 'div',
      'a'
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target'],
      span: ['style'],
      div: ['style'],
      p: ['style']
    },
    allowedSchemes: ['http', 'https', 'mailto']
  });
}

module.exports = { sanitizeNoteHtml };
