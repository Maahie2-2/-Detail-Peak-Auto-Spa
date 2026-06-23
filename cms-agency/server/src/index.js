const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy in production (Render sits behind a proxy)
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: config.nodeEnv === 'development' ? ['http://localhost:3000'] : false,
  credentials: true,
}));

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  name: 'cms.sid',
  proxy: config.nodeEnv === 'production',
  cookie: {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Rate limit login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many login attempts. Try again later.', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1', // skip for localhost
});
app.use('/api/auth/login', loginLimiter);

// Public static routes (website content — no auth required)
app.use('/content', express.static(config.contentPath));
app.use('/uploads', express.static(config.uploadsPath));

// API Routes (protected)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pages', authMiddleware, require('./routes/pages'));
app.use('/api/collections', authMiddleware, require('./routes/collections'));
app.use('/api/settings', authMiddleware, require('./routes/settings'));
app.use('/api/media', authMiddleware, require('./routes/media'));

// Admin dashboard SPA at /admin
const publicPath = path.join(__dirname, '../public');
app.use('/admin', express.static(publicPath));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Website files served from the parent workspace (car detailling folder)
const websitePath = path.join(__dirname, '../../../');
app.use(express.static(websitePath, {
  index: 'index.html',
}));

// SPA fallback for website
app.get('*', (req, res) => {
  res.sendFile(path.join(websitePath, 'index.html'));
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`CMS Server running on port ${config.port} [${config.nodeEnv}]`);
  console.log(`Website: http://localhost:${config.port}/`);
  console.log(`Admin:   http://localhost:${config.port}/admin`);
  if (config.nodeEnv === 'development') {
    console.log(`API:     http://localhost:${config.port}/api`);
  }
});
