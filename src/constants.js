/**
 * @fileoverview Client-side constants for ImpactBridge.
 * Centralizes all magic strings, categories, and sample data.
 *
 * @module constants
 * @version 1.0.0
 */

/** Need categories with icons and colors */
export const CATEGORIES = [
  { id: 'Education', icon: '📚', color: '#6366f1' },
  { id: 'Healthcare', icon: '🏥', color: '#ec4899' },
  { id: 'Food & Nutrition', icon: '🍚', color: '#f59e0b' },
  { id: 'Shelter', icon: '🏠', color: '#8b5cf6' },
  { id: 'Environment', icon: '🌱', color: '#10b981' },
  { id: 'Elderly Care', icon: '👴', color: '#f97316' },
  { id: 'Child Welfare', icon: '👶', color: '#06b6d4' },
  { id: 'Disability Support', icon: '♿', color: '#14b8a6' },
  { id: 'Infrastructure', icon: '🔧', color: '#64748b' },
  { id: 'Other', icon: '📋', color: '#78716c' },
];

/** Urgency levels with labels and colors */
export const URGENCY_LEVELS = {
  critical: { label: 'Critical', color: '#ef4444', bg: '#fef2f2' },
  high: { label: 'High', color: '#f97316', bg: '#fff7ed' },
  medium: { label: 'Medium', color: '#eab308', bg: '#fefce8' },
  low: { label: 'Low', color: '#22c55e', bg: '#f0fdf4' },
};

/** Available volunteer skills */
export const SKILLS = [
  'Teaching', 'Medical', 'Driving', 'Cooking', 'Construction',
  'Counseling', 'Technology', 'Logistics', 'Childcare', 'First Aid',
  'Fundraising', 'Translation', 'Administration', 'Plumbing', 'Electrical',
];

/** Navigation tabs */
export const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'extract', label: 'AI Parser', icon: '🤖' },
  { id: 'volunteers', label: 'Volunteers', icon: '👥' },
  { id: 'match', label: 'AI Match', icon: '🎯' },
  { id: 'impact', label: 'Impact', icon: '📈' },
];

/** Sample community data for demo purposes */
export const SAMPLE_DATA = `Field report from Anand Nagar, Bangalore — April 2026:

Visited 3 communities this week. In Sector 4, we found 15 elderly residents who haven't received medical checkups in over a year. Many have difficulty walking to the nearest clinic which is 3km away. They urgently need home-visit medical volunteers.

The community school in Sector 7 reported that 45 students in grades 4-6 are struggling with English and Mathematics. Teachers are overwhelmed and need volunteer tutors, ideally for weekend sessions.

A local women's self-help group in Sector 12 wants to set up a community kitchen but lacks volunteers with cooking skills and food safety training. They have the space and funding but no personnel.

Additionally, monsoon damage has left parts of Sector 4 with blocked drainage. Residents are concerned about waterborne diseases. Need volunteers with basic construction/plumbing skills for cleanup.

The existing community garden in Sector 7 has been abandoned. Environmental volunteers could revive it to provide fresh vegetables to the community kitchen.`;

/** API base URL */
export const API_BASE = '/api';
