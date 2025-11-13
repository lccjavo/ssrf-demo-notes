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

module.exports = { slugify };
