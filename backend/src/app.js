const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Route modules
const authRoutes = require('./modules/auth/auth.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');

const app = express();

// ──────────── Security Middleware ────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Swagger UI
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting on all auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// ──────────── Body Parsing ────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ──────────── Request Logger ────────────
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`);
  next();
});

// ──────────── API Docs ────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Primetrade TaskAPI Docs',
    customCss: `
      .swagger-ui .topbar { background: #1a0535; }
      .swagger-ui .topbar-wrapper img { display: none; }
      .swagger-ui .topbar-wrapper::after { content: '🚀 Primetrade TaskAPI'; color: #a78bfa; font-size: 1.2rem; font-weight: bold; }
    `,
  })
);

// Serve raw swagger JSON
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ──────────── Health Check ────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Primetrade TaskAPI is running 🚀', timestamp: new Date() });
});

// ──────────── API Routes ────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1', tasksRoutes);

// ──────────── Error Handling ────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
