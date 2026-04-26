/**
 * @fileoverview Centralized server configuration for ImpactBridge.
 * All environment variables and constants are managed here.
 *
 * @module config
 * @version 1.0.0
 */

import 'dotenv/config';

/** @type {object} Server configuration */
const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 4096,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  rateLimit: {
    windowMs: 60_000,
    max: 30,
  },

  cache: {
    stdTTL: 600,
    checkperiod: 120,
  },

  inputLimits: {
    bodyMaxSize: '500kb',
    textMaxLength: 5000,
    queryMaxLength: 500,
  },
};

export default config;
