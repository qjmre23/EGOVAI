import { describe, expect, it } from 'vitest';
import { DEMO_OFFICES } from './data.js';
import { haversineDistanceKm, sortOfficesByDistance } from './location.js';

describe('location helpers', () => {
  it('calculates Haversine distance', () => {
    expect(haversineDistanceKm(14.5995, 120.9842, 14.5865, 121.1762)).toBeGreaterThan(20);
  });

  it('sorts offices nearest first', () => {
    const offices = sortOfficesByDistance(DEMO_OFFICES, 14.5865, 121.1762);
    expect(offices[0]?.id).toBe('dfa-antipolo-demo');
    expect(offices[0]?.distanceKm).toBe(0);
  });
});
