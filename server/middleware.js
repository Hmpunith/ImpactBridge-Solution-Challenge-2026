/**
 * @fileoverview Security and utility middleware for ImpactBridge.
 * Implements: Helmet CSP, CORS, rate limiting, XSS sanitization,
 * request ID tracking, and Permissions-Policy.
 *
 * @module middleware
 * @version 1.0.0
 */

import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import crypto from 'crypto';
import xss from 'xss';
import config from './config.js';

/**
 * Helmet.js with custom Content Security Policy.
 * Whitelists Firebase, Google APIs, and Google Maps.
 * @returns {Function} Helmet middleware
 */
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'", 'https://apis.google.com', 'https://maps.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https://maps.gstatic.com', 'https://maps.googleapis.com'],
        connectSrc: [
          "'self'",
          'https://firestore.googleapis.com',
          'https://firebase.googleapis.com',
          'https://www.googleapis.com',
          'https://identitytoolkit.googleapis.com',
          'https://maps.googleapis.com',
        ],
        frameSrc: ["'self'", 'https://accounts.google.com'],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
}

/**
 * Permissions-Policy header restricting browser features.
 */
export function permissionsPolicy(req, res, next) {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), interest-cohort=()',
  );
  next();
}

/**
 * CORS middleware configured from environment.
 * @returns {Function} CORS middleware
 */
export function corsMiddleware() {
  return cors({ origin: config.cors.origin, credentials: true });
}

/**
 * Rate limiter for API endpoints.
 * @returns {Function} Rate limiting middleware
 */
export function apiRateLimiter() {
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { error: 'Too many requests. Please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Assigns a UUID v4 request ID to every incoming request.
 */
export function requestIdMiddleware(req, res, next) {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}

/**
 * Sanitizes all string values in the request body to prevent XSS.
 */
export function inputSanitizer(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
}
