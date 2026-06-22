const express = require('express');
const router = express.Router();
const fileStore = require('../utils/fileStore');
const validate = require('../utils/validate');

const SETTINGS_DIR = 'settings';

const ALLOWED_SETTINGS = ['business', 'seo', 'branding'];

router.get('/:name', (req, res, next) => {
  try {
    const { name } = req.params;
    if (!ALLOWED_SETTINGS.includes(name)) {
      const error = new Error('Settings not found');
      error.code = 'SETTINGS_NOT_FOUND';
      error.status = 404;
      throw error;
    }
    const data = fileStore.readJSON(SETTINGS_DIR, `${name}.json`);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.put('/:name', (req, res, next) => {
  try {
    const { name } = req.params;
    if (!ALLOWED_SETTINGS.includes(name)) {
      const error = new Error('Settings not allowed');
      error.code = 'SETTINGS_NOT_FOUND';
      error.status = 404;
      throw error;
    }
    const data = req.body;
    if (!data || typeof data !== 'object') {
      const error = new Error('Invalid settings data');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }
    fileStore.writeJSON(SETTINGS_DIR, `${name}.json`, data);
    res.json({ success: true, message: 'Settings saved', data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
