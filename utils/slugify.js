function slugify(str) {
  if (!str) return 'note';
  return (
    String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'note'
  );
}

module.exports = { slugify };
