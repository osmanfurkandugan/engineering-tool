import type { CalculationResult, SystemType, VoltageDropInputs } from '../../types';

export const CABLE_SECTIONS = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630];
export const CONDUCTIVITY_20C = { Cu: 56, Al: 35 } as const;
export const TEMP_COEFFICIENT = { Cu: 0.00393, Al: 0.00403 } as const;

export function resistancePerMetre(material: 'Cu' | 'Al', sectionMm2: number, tempC: number) {
  const k = CONDUCTIVITY_20C[material];
  const alpha = TEMP_COEFFICIENT[material];
  const rAt20 = 1 / (k * sectionMm2);
  return rAt20 * (1 + alpha * (tempC - 20));
}

export function currentFromPower(system: SystemType, powerWatts: number, voltage: number, cosPhi: number | null, efficiencyPct: number) {
  const eta = efficiencyPct / 100;
  if (system === 'DC') return powerWatts / (voltage * eta);
  if (system === '1') return powerWatts / (voltage * (cosPhi ?? 1) * eta);
  return powerWatts / (Math.sqrt(3) * voltage * (cosPhi ?? 1) * eta);
}

export function calcVoltageDrop({ system, current, lengthM, r, x, cosPhi }: { system: SystemType; current: number; lengthM: number; r: number; x: number; cosPhi: number | null; }) {
  const sinPhi = cosPhi !== null ? Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi)) : 0;

  if (system === 'DC') return 2 * current * r * lengthM;
  if (system === '1') return 2 * current * lengthM * (r * (cosPhi ?? 1) + x * sinPhi);
  return Math.sqrt(3) * current * lengthM * (r * (cosPhi ?? 1) + x * sinPhi);
}

export function calcDisplayResistance(system: SystemType, r: number, lengthM: number) {
  if (system === '3') return r * lengthM;
  return 2 * r * lengthM;
}

export function calcPowerLoss(system: SystemType, current: number, r: number, lengthM: number) {
  if (system === '3') return 3 * current * current * r * lengthM;
  return current * current * 2 * r * lengthM;
}

export function runCalculation(inputs: VoltageDropInputs): CalculationResult {
  const { system, voltage, current, lengthM, material, sectionMm2, tempC, x, cosPhi } = inputs;
  const r = resistancePerMetre(material, sectionMm2, tempC);
  const deltaU = calcVoltageDrop({ system, current, lengthM, r, x, cosPhi });
  const percent = (deltaU / voltage) * 100;
  const finalVoltage = voltage - deltaU;
  const resistance = calcDisplayResistance(system, r, lengthM);
  const powerLoss = calcPowerLoss(system, current, r, lengthM);

  return { deltaU, percent, finalVoltage, resistance, powerLoss, current, startVoltage: voltage };
}

export function findRecommendedSize(inputs: VoltageDropInputs, maxPercent: number) {
  for (const section of CABLE_SECTIONS) {
    const result = runCalculation({ ...inputs, sectionMm2: section });
    if (result.percent <= maxPercent) {
      return { section, ...result };
    }
  }
  return null;
}
