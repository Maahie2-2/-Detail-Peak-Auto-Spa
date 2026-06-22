const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const fileStore = require('../utils/fileStore');
const hash = require('../utils/hash');
const validate = require('../utils/validate');
const config = require('../config/config');

const AUTH_FILE = 'auth.json';
const SETTINGS_DIR = 'settings';

async function ensureAuthUser() {
  try {
    return fileStore.readJSON(SETTINGS_DIR, AUTH_FILE);
  } catch (e) {
    if (e.code === 'FILE_NOT_FOUND') {
      const defaultPassword = await hash.hashPassword('changeme');
      const defaultUser = { username: 'admin', passwordHash: defaultPassword };
      fileStore.writeJSON(SETTINGS_DIR, AUTH_FILE, defaultUser);
      console.warn('WARNING: Default admin user created with password "changeme". Please change this immediately.');
      return defaultUser;
    }
    throw e;
  }
}

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    validate.requireBodyFields(req.body, ['username', 'password']);

    const user = await ensureAuthUser();
    if (user.username !== username) {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      error.status = 401;
      throw error;
    }

    const valid = await hash.comparePassword(password, user.passwordHash);
    if (!valid) {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      error.status = 401;
      throw error;
    }

    req.session.userId = user.username;
    res.json({ success: true, message: 'Logged in', user: { username: user.username } });
  } catch (e) {
    next(e);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Logged out' });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ success: true, user: { username: req.session.userId } });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated', code: 'UNAUTHORIZED' });
  }
});

router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    validate.requireBodyFields(req.body, ['currentPassword', 'newPassword']);
    if (newPassword.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const user = await ensureAuthUser();
    const valid = await hash.comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      const error = new Error('Current password is incorrect');
      error.code = 'INVALID_CREDENTIALS';
      error.status = 401;
      throw error;
    }

    user.passwordHash = await hash.hashPassword(newPassword);
    fileStore.writeJSON(SETTINGS_DIR, AUTH_FILE, user);
    res.json({ success: true, message: 'Password updated' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
