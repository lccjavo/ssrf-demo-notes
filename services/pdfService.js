const PDFDocument = require('pdfkit');

// Pequeño helper para el nombre del archivo
function slugify(str) {
  if (!str) return 'nota';
  return (
    String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'nota'
  );
}

// Decodificar las entidades HTML más comunes
function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Convertir HTML (de TinyMCE) a texto plano legible para el PDF
function htmlToPlainText(html) {
  let text = String(html || '');

  // Saltos de línea razonables
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/(p|div|h[1-6])>/gi, '\n\n');
  text = text.replace(/<li[^>]*>/gi, ' • ');
  text = text.replace(/<\/li>/gi, '\n');

  // Quitar cualquier otra etiqueta
  text = text.replace(/<[^>]+>/g, '');

  // Decodificar entidades (&nbsp;, &amp;, etc.)
  text = decodeHtmlEntities(text);

  // Compactar saltos de línea excesivos
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

function createNotePdf(note) {
  const filename = `${slugify(note.title || 'nota')}.pdf`;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const bodyText = htmlToPlainText(note.content || '(sin contenido)');

  // Título
  doc.fontSize(20).text(note.title || 'Nota', { align: 'left' });
  doc.moveDown(0.5);

  // Fecha de creación
  if (note.created_at) {
    doc.fontSize(10).fillColor('gray');
    doc.text(`Creada: ${note.created_at}`, { align: 'left' });
    doc.moveDown();
  }

  // Contenido
  doc.fontSize(12).fillColor('black');
  doc.text(bodyText || '(sin contenido)', {
    align: 'left',
  });

  return { doc, filename };
}

module.exports = {
  createNotePdf,
};
