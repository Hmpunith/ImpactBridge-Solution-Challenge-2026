/**
 * @fileoverview Schema validation tests for ImpactBridge.
 */

import { describe, it, expect } from 'vitest';
import { NeedSchema, NeedExtractionSchema, MatchResponseSchema, ImpactReportSchema } from '../server/schemas.js';

describe('NeedSchema', () => {
  it('accepts valid need', () => {
    const result = NeedSchema.safeParse({
      title: 'Test Need',
      description: 'A valid description',
      category: 'Education',
      urgency: 'high',
      estimatedVolunteers: 5,
      skills: ['teaching'],
      location: 'Sector 7',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = NeedSchema.safeParse({ title: '', description: 'x', category: 'Education', urgency: 'high', estimatedVolunteers: 0, skills: [], location: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid urgency', () => {
    const result = NeedSchema.safeParse({ title: 'x', description: 'x', category: 'Education', urgency: 'extreme', estimatedVolunteers: 0, skills: [], location: '' });
    expect(result.success).toBe(false);
  });
});

describe('NeedExtractionSchema', () => {
  it('accepts valid extraction result', () => {
    const result = NeedExtractionSchema.safeParse({
      needs: [{ title: 'Test', description: 'Desc', category: 'Education', urgency: 'low', estimatedVolunteers: 1, skills: [], location: 'Here' }],
      summary: 'Found 1 need',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty needs array', () => {
    const result = NeedExtractionSchema.safeParse({ needs: [], summary: 'None' });
    expect(result.success).toBe(false);
  });
});

describe('MatchResponseSchema', () => {
  it('accepts valid match response', () => {
    const result = MatchResponseSchema.safeParse({
      matches: [{ needTitle: 'A', volunteerName: 'B', matchScore: 85, reason: 'Good fit' }],
      unmatchedNeeds: [],
      suggestions: ['Recruit more'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects match score above 100', () => {
    const result = MatchResponseSchema.safeParse({
      matches: [{ needTitle: 'A', volunteerName: 'B', matchScore: 150, reason: 'x' }],
      unmatchedNeeds: [],
      suggestions: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('ImpactReportSchema', () => {
  it('accepts valid impact report', () => {
    const result = ImpactReportSchema.safeParse({
      headline: 'Great impact!',
      metrics: { livesImpacted: 100, hoursContributed: 50, needsResolved: 10, activeVolunteers: 20 },
      insights: ['Insight 1'],
      recommendations: ['Rec 1'],
    });
    expect(result.success).toBe(true);
  });
});
