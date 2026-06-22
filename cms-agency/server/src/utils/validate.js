const validate = {
  slugRegex: /^[a-z0-9-]+$/,

  isValidSlug(slug) {
    return this.slugRegex.test(slug);
  },

  isValidFilename(filename) {
    return /^[a-zA-Z0-9._-]+$/.test(filename) && !filename.includes('..');
  },

  sanitizeSlug(slug) {
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  },

  requireBodyFields(body, fields) {
    const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
    if (missing.length > 0) {
      const error = new Error(`Missing required fields: ${missing.join(', ')}`);
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
  },
};

module.exports = validate;
