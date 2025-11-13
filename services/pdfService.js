const PDFDocument = require('pdfkit');
const { sanitizeNoteHtml } = require('../utils/sanitize');

// Helper para el nombre del archivo
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

// Decodificar entidades HTML comunes
function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/\r/g, '')       // quitar \r que a veces mete símbolos raros
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')  // NBSP real
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Quitar etiquetas HTML (después de manejar las importantes)
function stripTags(str) {
  return String(str || '').replace(/<[^>]+>/g, '');
}

function renderHtmlToPdf(doc, htmlRaw) {
  // Si es null/undefined
  if (htmlRaw == null) {
    doc.fontSize(12).text('(sin contenido)');
    return;
  }

  // Normalizamos a string y quitamos espacios basura
  let html = String(htmlRaw);
  const originalTrimmed = html.trim();

  if (!originalTrimmed) {
    doc.fontSize(12).text('(sin contenido)');
    return;
  }

  html = decodeHtmlEntities(html).replace(/\r/g, '');

  // 👉 1) Si NO parece HTML, lo tratamos como texto plano
  const looksLikeHtml = /<\s*\w+[^>]*>/.test(html); // algo tipo <tag>

  if (!looksLikeHtml) {
    const plain = html.replace(/\n{3,}/g, '\n\n').trim();
    doc.fontSize(12).fillColor('black').text(plain || '(sin contenido)', {
      align: 'left',
    });
    return;
  }

  // 👉 2) Si SÍ parece HTML, intentamos parsear bloques
  // Reemplazar <br> por saltos de línea explícitos
  html = html.replace(/<br\s*\/?>/gi, '\n');

  const blockRegex = /<(h[1-6]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  let foundAny = false;

  while ((match = blockRegex.exec(html)) !== null) {
    foundAny = true;
    const tag = match[1].toLowerCase();
    let inner = match[2] || '';

    inner = stripTags(inner);
    inner = decodeHtmlEntities(inner).trim();
    if (!inner) continue;

    if (tag.startsWith('h')) {
      const level = parseInt(tag[1], 10) || 1;
      const size =
        level === 1 ? 20 :
        level === 2 ? 16 :
        level === 3 ? 14 : 13;

      doc.moveDown(0.6);
      doc.fontSize(size).fillColor('black').text(inner, { align: 'left' });
      doc.moveDown(0.2);
      doc.fontSize(12); // reset
    } else if (tag === 'p') {
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor('black').text(inner, { align: 'left' });
    } else if (tag === 'li') {
      doc.fontSize(12).fillColor('black').text('• ' + inner, { align: 'left' });
    }
  }

  // 👉 3) Si no encontramos ningún bloque H/P/LI pero sí hay texto,
  // hacemos fallback a texto plano en vez de "(sin contenido)"
  if (!foundAny) {
    const plain = stripTags(html);
    const clean = decodeHtmlEntities(plain).trim();

    doc.fontSize(12).fillColor('black').text(
      clean || originalTrimmed || '(sin contenido)',
      { align: 'left' }
    );
  }
}


function createNotePdf(note) {
  const filename = `${slugify(note.title || 'nota')}.pdf`;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Título
  doc.fontSize(20).fillColor('black').text(note.title || 'Nota', {
    align: 'left',
  });
  doc.moveDown(0.5);

  // Fecha
  if (note.created_at) {
    doc.fontSize(10).fillColor('gray');
    doc.text(`Creada: ${note.created_at}`, { align: 'left' });
    doc.moveDown();
  }

  // 🔴 AQUÍ: usar mismo sanitizado que la vista
  const rawContent = note.content || '';
  const safeHtml = sanitizeNoteHtml
    ? sanitizeNoteHtml(rawContent)
    : rawContent;

  doc.fontSize(12).fillColor('black');
  renderHtmlToPdf(doc, safeHtml);

  return { doc, filename };
}

module.exports = {
  createNotePdf,
};
