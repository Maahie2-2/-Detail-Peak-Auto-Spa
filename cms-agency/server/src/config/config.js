const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'cms-default-secret-change-me',
  contentPath: path.join(__dirname, '../../../content'),
  uploadsPath: path.join(__dirname, '../../../content/uploads'),
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
};

module.exports = config;
