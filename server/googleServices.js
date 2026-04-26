/**
 * @fileoverview Google Cloud services for ImpactBridge.
 * Centralizes: Gemini AI, Cloud Logging, and Pino logger.
 *
 * @module googleServices
 * @version 1.0.0
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logging } from '@google-cloud/logging';
import pino from 'pino';
import config from './config.js';

/** @type {import('pino').Logger} */
export const logger = pino({
  level: config.logLevel,
});

/** @type {GoogleGenerativeAI} */
export const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// ── Google Cloud Logging ───────────────────────────────────────────────

const cloudLogging = new Logging();
const cloudLog = cloudLogging.log('impactbridge-server');

/**
 * Writes a structured log entry to Google Cloud Logging.
 * @param {string} severity - INFO, WARNING, ERROR, CRITICAL
 * @param {string} message - Log message
 * @param {object} [data={}] - Structured metadata
 * @returns {Promise<void>}
 */
export async function writeCloudLog(severity, message, data = {}) {
  try {
    const entry = cloudLog.entry(
      { severity, resource: { type: 'cloud_run_revision' } },
      { message, ...data, service: 'impactbridge', timestamp: new Date().toISOString() },
    );
    await cloudLog.write(entry);
  } catch (_err) {
    // Expected in non-GCP environments
  }
}
