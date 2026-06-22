const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const validate = require('../utils/validate');
const fileStore = require('../utils/fileStore');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadsPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    const timestamp = Date.now();
    cb(null, `${base}-${timestamp}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (req, file, cb) => {
    if (config.allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, WebP, SVG, GIF)'));
    }
  },
});

router.get('/', (req, res, next) => {
  try {
    if (!fs.existsSync(config.uploadsPath)) {
      return res.json({ success: true, data: [] });
    }
    const files = fs
      .readdirSync(config.uploadsPath)
      .map((filename) => {
        const stat = fs.statSync(path.join(config.uploadsPath, filename));
        return {
          filename,
          url: `/uploads/${filename}`,
          size: stat.size,
          createdAt: stat.birthtime.toISOString(),
        };
      })
      .filter((f) => f.size > 0);
    res.json({ success: true, data: files });
  } catch (e) {
    next(e);
  }
});

router.post('/upload', upload.array('files', 10), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      const error = new Error('No files uploaded');
      error.code = 'NO_FILES';
      error.status = 400;
      throw error;
    }
    const files = req.files.map((f) => ({
      filename: f.filename,
      url: `/uploads/${f.filename}`,
      size: f.size,
    }));
    res.json({ success: true, message: 'Files uploaded', data: files });
  } catch (e) {
    next(e);
  }
});

router.delete('/:filename', (req, res, next) => {
  try {
    const { filename } = req.params;
    if (!validate.isValidFilename(filename)) {
      const error = new Error('Invalid filename');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }
    const filePath = path.join(config.uploadsPath, filename);
    if (!fs.existsSync(filePath)) {
      const error = new Error('File not found');
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // Check for references in all JSON files
    const references = [];
    const checkDir = (dir, subPath) => {
      const fullDir = path.join(config.contentPath, subPath);
      if (!fs.existsSync(fullDir)) return;
      const entries = fs.readdirSync(fullDir);
      for (const entry of entries) {
        const fullPath = path.join(fullDir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          checkDir(entry, path.join(subPath, entry));
        } else if (entry.endsWith('.json')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes(`/uploads/${filename}`)) {
              references.push(path.join(subPath, entry).replace(/\\/g, '/'));
            }
          } catch (e) {
            // skip
          }
        }
      }
    };
    checkDir('', '');

    if (references.length > 0) {
      const error = new Error('File is referenced in content. Remove references before deleting.');
      error.code = 'FILE_IN_USE';
      error.status = 400;
      error.references = references;
      throw error;
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
