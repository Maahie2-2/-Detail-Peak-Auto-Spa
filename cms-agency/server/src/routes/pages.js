const express = require('express');
const router = express.Router();
const fileStore = require('../utils/fileStore');
const validate = require('../utils/validate');

const PAGES_DIR = 'pages';

router.get('/', (req, res, next) => {
  try {
    const pages = fileStore.listFiles(PAGES_DIR, '.json');
    res.json({ success: true, data: pages });
  } catch (e) {
    next(e);
  }
});

router.get('/:slug', (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!validate.isValidSlug(slug)) {
      const error = new Error('Invalid slug');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }
    const page = fileStore.readJSON(PAGES_DIR, `${slug}.json`);
    res.json({ success: true, data: page });
  } catch (e) {
    next(e);
  }
});

router.put('/:slug', (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!validate.isValidSlug(slug)) {
      const error = new Error('Invalid slug');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }
    const pageData = req.body;
    if (!pageData || typeof pageData !== 'object') {
      const error = new Error('Invalid page data');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }
    pageData.slug = slug;
    pageData.updatedAt = new Date().toISOString();
    fileStore.writeJSON(PAGES_DIR, `${slug}.json`, pageData);
    res.json({ success: true, message: 'Page saved', data: pageData });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
