const express = require('express');
const router = express.Router();
const fileStore = require('../utils/fileStore');
const validate = require('../utils/validate');

const COLLECTIONS_DIR = 'collections';

const ALLOWED_COLLECTIONS = ['testimonials', 'faqs', 'services', 'team', 'blog-posts', 'packages', 'vehicles'];

router.get('/:name', (req, res, next) => {
  try {
    const { name } = req.params;
    if (!ALLOWED_COLLECTIONS.includes(name)) {
      const error = new Error('Collection not found');
      error.code = 'COLLECTION_NOT_FOUND';
      error.status = 404;
      throw error;
    }
    const collection = fileStore.readJSON(COLLECTIONS_DIR, `${name}.json`);
    res.json({ success: true, data: collection });
  } catch (e) {
    next(e);
  }
});

router.put('/:name', (req, res, next) => {
  try {
    const { name } = req.params;
    if (!ALLOWED_COLLECTIONS.includes(name)) {
      const error = new Error('Collection not allowed');
      error.code = 'COLLECTION_NOT_FOUND';
      error.status = 404;
      throw error;
    }
    const data = req.body;
    if (!data || typeof data !== 'object') {
      const error = new Error('Invalid collection data');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }
    data.updatedAt = new Date().toISOString();
    fileStore.writeJSON(COLLECTIONS_DIR, `${name}.json`, data);
    res.json({ success: true, message: 'Collection saved', data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
