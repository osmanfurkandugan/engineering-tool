import { describe, expect, it } from 'vitest';
import { calculateShortCircuit, type ShortCircuitInputs } from './engine';

const transformerOnlyInputs: ShortCircuitInputs = {
  voltageV: 400,
  transformerKva: 1000,
  ukPercent: 6,
  copperLossKw: 10,
  voltageFactor: 1,
  upstreamShortCircuitMva: null,
  upstreamXOverR: 10,
  cableLengthM: 0,
  cableSectionMm2: 240,
  material: 'Cu',
  conductorTempC: 20,
  cableReactanceOhmsPerKm: 0.08,
};

describe('calculateShortCircuit', () => {
  it('matches transformer impedance current for a known 1 MVA case', () => {
    const result = calculateShortCircuit(transformerOnlyInputs);
    const expectedCurrent = 1000_000 / (Math.sqrt(3) * 400 * 0.06);

    expect(result?.initialSymmetricalCurrentA).toBeCloseTo(expectedCurrent, 6);
    expect(result?.peakCurrentA).toBeGreaterThan(result?.initialSymmetricalCurrentA ?? 0);
  });

  it('reduces fault current when cable impedance is added', () => {
    const transformerOnly = calculateShortCircuit(transformerOnlyInputs);
    const withCable = calculateShortCircuit({
      ...transformerOnlyInputs,
      cableLengthM: 100,
      cableSectionMm2: 50,
      cableReactanceOhmsPerKm: 0.08,
    });

    expect(withCable?.initialSymmetricalCurrentA).toBeLessThan(transformerOnly?.initialSymmetricalCurrentA ?? Infinity);
  });

  it('rejects inconsistent transformer copper loss and impedance data', () => {
    const result = calculateShortCircuit({ ...transformerOnlyInputs, copperLossKw: 500 });

    expect(result).toBeNull();
  });
});