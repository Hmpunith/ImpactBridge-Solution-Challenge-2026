/**
 * @fileoverview Zod validation schemas for ImpactBridge API.
 * Validates all AI outputs and API request/response shapes.
 *
 * @module schemas
 * @version 1.0.0
 */

import { z } from 'zod';

/** Schema for a single extracted community need */
export const NeedSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  category: z.string(),
  urgency: z.enum(['critical', 'high', 'medium', 'low']),
  estimatedVolunteers: z.number().int().min(0),
  skills: z.array(z.string()),
  location: z.string(),
});

/** Schema for the AI need extraction response */
export const NeedExtractionSchema = z.object({
  needs: z.array(NeedSchema).min(1),
  summary: z.string(),
});

/** Schema for a volunteer-need match */
const MatchSchema = z.object({
  needTitle: z.string(),
  volunteerName: z.string(),
  matchScore: z.number().min(0).max(100),
  reason: z.string(),
});

/** Schema for the AI matching response */
export const MatchResponseSchema = z.object({
  matches: z.array(MatchSchema),
  unmatchedNeeds: z.array(z.string()),
  suggestions: z.array(z.string()),
});

/** Schema for the AI impact analysis response */
export const ImpactReportSchema = z.object({
  headline: z.string(),
  metrics: z.object({
    livesImpacted: z.number(),
    hoursContributed: z.number(),
    needsResolved: z.number(),
    activeVolunteers: z.number(),
  }),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
});
