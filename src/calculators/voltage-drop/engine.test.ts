import { describe, expect, it } from 'vitest';
import { calcVoltageDrop } from './engine';

describe('calcVoltageDrop', () => {
  it('converts reactance from ohms per kilometre for a three-phase run', () => {
    const result = calcVoltageDrop({
      system: '3',
      current: 10,
      lengthM: 1000,
      r: 0,
      reactanceOhmsPerKm: 0.08,
      cosPhi: 0.8,
    });

    expect(result).toBeCloseTo(Math.sqrt(3) * 10 * 0.08 * 0.6, 10);
  });

  it('uses the single-phase return-path factor with reactance', () => {
    const result = calcVoltageDrop({
      system: '1',
      current: 10,
      lengthM: 1000,
      r: 0,
      reactanceOhmsPerKm: 0.08,
      cosPhi: 0.8,
    });

    expect(result).toBeCloseTo(2 * 10 * 0.08 * 0.6, 10);
  });
});