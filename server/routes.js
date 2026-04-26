/**
 * @fileoverview API route handlers for ImpactBridge.
 * Endpoints: health, extract-needs, match-volunteers, impact-report.
 *
 * @module routes
 * @version 1.0.0
 */

import express from 'express';
import NodeCache from 'node-cache';
import crypto from 'crypto';
import { genAI, logger, writeCloudLog } from './googleServices.js';
import { NeedExtractionSchema, MatchResponseSchema, ImpactReportSchema } from './schemas.js';
import { NEED_EXTRACTOR_INSTRUCTION, VOLUNTEER_MATCHER_INSTRUCTION, IMPACT_ANALYZER_INSTRUCTION } from './prompts.js';
import { ValidationError, AIServiceError } from './errors.js';
import config from './config.js';

const router = express.Router();
const responseCache = new NodeCache({ stdTTL: config.cache.stdTTL, checkperiod: config.cache.checkperiod });

/**
 * Generates an MD5 hash for cache key generation.
 * @param {string} input - String to hash
 * @returns {string} MD5 hex digest
 */
function generateCacheKey(input) {
  return crypto.createHash('md5').update(input.trim().toLowerCase()).digest('hex');
}

/**
 * Calls Google Gemini with system instruction, validates output against schema.
 * @param {string} systemInstruction - AI persona
 * @param {string} userPrompt - User input
 * @param {import('zod').ZodSchema} schema - Validation schema
 * @param {string} cachePrefix - Cache namespace
 * @returns {Promise<object>} Validated AI response
 * @throws {AIServiceError} If validation fails
 */
async function callGemini(systemInstruction, userPrompt, schema, cachePrefix) {
  const cacheKey = `${cachePrefix}:${generateCacheKey(userPrompt)}`;
  const cached = responseCache.get(cacheKey);

  if (cached) {
    logger.info({ cacheKey }, 'Cache Hit');
    return cached;
  }

  logger.info({ cacheKey: cacheKey.substring(0, 25) }, 'Cache Miss — Calling Gemini');

  const model = genAI.getGenerativeModel({
    model: config.gemini.model,
    systemInstruction,
    generationConfig: {
      temperature: config.gemini.temperature,
      topP: config.gemini.topP,
      maxOutputTokens: config.gemini.maxOutputTokens,
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    logger.error({ errors: validated.error.issues }, 'Schema validation failed');
    throw new AIServiceError('AI response failed validation');
  }

  responseCache.set(cacheKey, validated.data);
  logger.info({ cacheKey }, 'Response cached');
  return validated.data;
}

// ── Routes ──────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Health check for Cloud Run load balancer.
 */
router.get('/health', (req, res) => {
  writeCloudLog('INFO', 'Health check', { requestId: req.requestId });
  res.json({
    status: 'healthy',
    service: 'impactbridge',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

/**
 * POST /api/extract-needs
 * Parses unstructured community data into structured needs using Gemini AI.
 */
router.post('/extract-needs', async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new ValidationError('Community data text is required.');
    }

    if (!config.gemini.apiKey) {
      throw new AIServiceError('Gemini service is not configured.');
    }

    const result = await callGemini(
      NEED_EXTRACTOR_INSTRUCTION,
      text.substring(0, config.inputLimits.textMaxLength),
      NeedExtractionSchema,
      'needs',
    );

    res.json(result);
    writeCloudLog('INFO', 'Needs extracted', {
      requestId: req.requestId,
      needsCount: result.needs.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/match-volunteers
 * Matches available volunteers to community needs using Gemini AI.
 */
router.post('/match-volunteers', async (req, res, next) => {
  try {
    const { needs, volunteers } = req.body;

    if (!needs || !Array.isArray(needs) || needs.length === 0) {
      throw new ValidationError('At least one community need is required.');
    }
    if (!volunteers || !Array.isArray(volunteers) || volunteers.length === 0) {
      throw new ValidationError('At least one volunteer is required.');
    }

    if (!config.gemini.apiKey) {
      throw new AIServiceError('Gemini service is not configured.');
    }

    const prompt = `Match these volunteers to needs:\n\nNeeds:\n${JSON.stringify(needs, null, 2)}\n\nVolunteers:\n${JSON.stringify(volunteers, null, 2)}`;

    const result = await callGemini(
      VOLUNTEER_MATCHER_INSTRUCTION,
      prompt,
      MatchResponseSchema,
      'match',
    );

    res.json(result);
    writeCloudLog('INFO', 'Volunteers matched', {
      requestId: req.requestId,
      matchCount: result.matches.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/impact-report
 * Generates an AI-powered impact analysis report.
 */
router.post('/impact-report', async (req, res, next) => {
  try {
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      throw new ValidationError('Impact data object is required.');
    }

    if (!config.gemini.apiKey) {
      throw new AIServiceError('Gemini service is not configured.');
    }

    const result = await callGemini(
      IMPACT_ANALYZER_INSTRUCTION,
      `Generate impact report for: ${JSON.stringify(data)}`,
      ImpactReportSchema,
      'impact',
    );

    res.json(result);
    writeCloudLog('INFO', 'Impact report generated', { requestId: req.requestId });
  } catch (error) {
    next(error);
  }
});

export default router;
