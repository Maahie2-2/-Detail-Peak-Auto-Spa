const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const config = require('../config/config');

const fileStore = {
  getContentPath(subDir, filename) {
    const safeName = path.basename(filename);
    const fullPath = path.join(config.contentPath, subDir, safeName);
    // Prevent path traversal
    if (!fullPath.startsWith(path.join(config.contentPath, subDir))) {
      throw new Error('Invalid path');
    }
    return fullPath;
  },

  readJSON(subDir, filename) {
    const filePath = this.getContentPath(subDir, filename);
    if (!fs.existsSync(filePath)) {
      const error = new Error('File not found');
      error.code = 'FILE_NOT_FOUND';
      throw error;
    }
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      const error = new Error('Invalid JSON file');
      error.code = 'INVALID_JSON';
      throw error;
    }
  },

  writeJSON(subDir, filename, data) {
    const filePath = this.getContentPath(subDir, filename);
    const dir = path.dirname(filePath);
    fse.ensureDirSync(dir);
    const tempPath = filePath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  },

  listFiles(subDir, ext = '.json') {
    const dirPath = path.join(config.contentPath, subDir);
    fse.ensureDirSync(dirPath);
    return fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith(ext))
      .map((f) => ({
        name: f.replace(ext, ''),
        filename: f,
      }));
  },

  deleteFile(subDir, filename) {
    const filePath = this.getContentPath(subDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  },

  fileExists(subDir, filename) {
    const filePath = this.getContentPath(subDir, filename);
    return fs.existsSync(filePath);
  },
};

module.exports = fileStore;
