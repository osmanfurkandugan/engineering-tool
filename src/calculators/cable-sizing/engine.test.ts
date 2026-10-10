import { describe, expect, it } from 'vitest';
import { calculateCableSizing } from './engine';

describe('calculateCableSizing', () => {
  it('returns the first table section that satisfies the design current', () => {
    const result = calculateCableSizing({
      loadCurrent: 28,
      conductors: '3',
      method: 'B1',
      temp: '30',
      group: '1',
      material: 'Cu',
    });

    expect(result).toEqual({ section: 4, iz: 28, utilization: 100, valid: true });
  });

  it('reports when the current exceeds the available table range', () => {
    const result = calculateCableSizing({
      loadCurrent: 10000,
      conductors: '3',
      method: 'B1',
      temp: '30',
      group: '1',
      material: 'Cu',
    });

    expect(result?.valid).toBe(false);
  });
});