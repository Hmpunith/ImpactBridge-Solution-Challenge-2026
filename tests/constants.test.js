/**
 * @fileoverview Constants tests for ImpactBridge.
 */

import { describe, it, expect } from 'vitest';
import { CATEGORIES, URGENCY_LEVELS, SKILLS, TABS, SAMPLE_DATA, API_BASE } from '../src/constants.js';

describe('Constants', () => {
  it('CATEGORIES should have 10 items', () => {
    expect(CATEGORIES).toHaveLength(10);
  });

  it('every category should have id, icon, and color', () => {
    CATEGORIES.forEach((cat) => {
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('icon');
      expect(cat).toHaveProperty('color');
    });
  });

  it('URGENCY_LEVELS should have 4 levels', () => {
    expect(Object.keys(URGENCY_LEVELS)).toHaveLength(4);
    expect(URGENCY_LEVELS).toHaveProperty('critical');
    expect(URGENCY_LEVELS).toHaveProperty('high');
    expect(URGENCY_LEVELS).toHaveProperty('medium');
    expect(URGENCY_LEVELS).toHaveProperty('low');
  });

  it('each urgency level should have label, color, bg', () => {
    Object.values(URGENCY_LEVELS).forEach((level) => {
      expect(level).toHaveProperty('label');
      expect(level).toHaveProperty('color');
      expect(level).toHaveProperty('bg');
    });
  });

  it('SKILLS should be a non-empty array of strings', () => {
    expect(SKILLS.length).toBeGreaterThan(0);
    SKILLS.forEach((skill) => expect(typeof skill).toBe('string'));
  });

  it('TABS should have 5 navigation items', () => {
    expect(TABS).toHaveLength(5);
  });

  it('each tab should have id, label, icon', () => {
    TABS.forEach((tab) => {
      expect(tab).toHaveProperty('id');
      expect(tab).toHaveProperty('label');
      expect(tab).toHaveProperty('icon');
    });
  });

  it('SAMPLE_DATA should be a non-empty string', () => {
    expect(typeof SAMPLE_DATA).toBe('string');
    expect(SAMPLE_DATA.length).toBeGreaterThan(100);
  });

  it('API_BASE should be /api', () => {
    expect(API_BASE).toBe('/api');
  });
});
