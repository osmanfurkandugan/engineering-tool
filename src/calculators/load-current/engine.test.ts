import { describe, expect, it } from 'vitest';
import { calculateLoadCurrent } from './engine';

describe('calculateLoadCurrent', () => {
  it('calculates three-phase current and output-power-derived input power', () => {
    const result = calculateLoadCurrent({
      powerValue: 1,
      powerUnit: 'kW',
      system: '3',
      voltage: 100,
      cosPhi: 1,
      efficiency: 100,
    });

    expect(result?.current).toBeCloseTo(1000 / (Math.sqrt(3) * 100), 10);
    expect(result?.inputPowerKw).toBe(1);
    expect(result?.suggestedRating).toBeCloseTo((1000 / (Math.sqrt(3) * 100)) * 1.25, 10);
  });

  it('rejects efficiency above 100 percent', () => {
    const result = calculateLoadCurrent({
      powerValue: 1,
      powerUnit: 'kW',
      system: '3',
      voltage: 400,
      cosPhi: 0.9,
      efficiency: 101,
    });

    expect(result).toBeNull();
  });
});