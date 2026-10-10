import { describe, expect, it } from 'vitest';
import { calculatePowerFactorCorrection } from './engine';

describe('calculatePowerFactorCorrection', () => {
  it('calculates capacitor kvar and current reduction for a three-phase load', () => {
    const result = calculatePowerFactorCorrection({
      activePowerKw: 100,
      system: '3',
      voltageV: 400,
      initialPowerFactor: 0.8,
      targetPowerFactor: 0.95,
    });

    expect(result?.requiredCapacitorKvar).toBeCloseTo(42.1316, 3);
    expect(result?.initialCurrentA).toBeCloseTo(180.42196, 3);
    expect(result?.targetCurrentA).toBeCloseTo(151.934, 2);
    expect(result?.currentReductionPercent).toBeCloseTo(15.7895, 3);
  });

  it('rejects a target power factor that does not exceed the initial value', () => {
    const result = calculatePowerFactorCorrection({
      activePowerKw: 10,
      system: '1',
      voltageV: 230,
      initialPowerFactor: 0.9,
      targetPowerFactor: 0.85,
    });

    expect(result).toBeNull();
  });

  it('supports correction to unity without negative kvar', () => {
    const result = calculatePowerFactorCorrection({
      activePowerKw: 10,
      system: '1',
      voltageV: 230,
      initialPowerFactor: 0.8,
      targetPowerFactor: 1,
    });

    expect(result?.requiredCapacitorKvar).toBeCloseTo(7.5, 10);
    expect(result?.targetCurrentA).toBeCloseTo(10000 / 230, 10);
  });
});