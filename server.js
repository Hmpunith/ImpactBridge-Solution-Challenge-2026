/**
 * @fileoverview ImpactBridge Backend Server — Entry Point
 * AI-powered volunteer coordination platform for social impact.
 *
 * Architecture:
 * - server/config.js        → Centralized configuration
 * - server/errors.js        → Custom Error classes (AppError, ValidationError)
 * - server/middleware.js     → Security & utility middleware
 * - server/googleServices.js → Gemini AI + Cloud Logging
 * - server/schemas.js        → Zod validation schemas
 * - server/prompts.js        → AI system instructions
 * - server/routes.js         → API route handlers
 *
 * Google Cloud Services:
 *  1. Google Gemini 2.5 Flash — AI for need extraction + volunteer matching
 *  2. Google Cloud Run         — Production deployment
 *  3. Google Cloud Logging     — Observability
 *  4. Firebase Firestore       — Needs + volunteer persistence
 *  5. Firebase Auth            — Google Sign-In
 *  6. Firebase Analytics       — User engagement tracking
 *  7. Google Maps API          — Location-based visualization
 *  8. Google Fonts             — Typography CDN
 *
 * @author Team Parsec
 * @version 1.0.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './server/config.js';
import { logger } from './server/googleServices.js';
import {
  securityHeaders,
  permissionsPolicy,
  corsMiddleware,
  apiRateLimiter,
  requestIdMiddleware,
  inputSanitizer,
} from './server/middleware.js';
import apiRoutes from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Middleware Stack ───────────────────────────────────────────────────

app.use(securityHeaders());
app.use(permissionsPolicy);
app.use((await import('compression')).default());
app.use(corsMiddleware());
app.use(express.json({ limit: config.inputLimits.bodyMaxSize }));
app.use(requestIdMiddleware);
app.use(inputSanitizer);

// ── API Routes ────────────────────────────────────────────────────────

app.use('/api', apiRateLimiter(), apiRoutes);

// ── Static Files (Vite build output) ──────────────────────────────────

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ── Centralized Error Handler ─────────────────────────────────────────

app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'An unexpected error occurred';

  logger.error({
    error: err.message,
    stack: err.stack,
    statusCode,
    code: err.code,
    requestId: req.requestId,
    path: req.path,
  });

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    requestId: req.requestId,
  });
});

// ── Server Start ──────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, '0.0.0.0', () => {
    logger.info(`🌉 ImpactBridge running on port ${config.port}`);
  });
}

export default app;
