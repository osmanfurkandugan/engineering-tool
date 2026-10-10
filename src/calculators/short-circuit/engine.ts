export interface ShortCircuitInputs {
  voltageV: number;
  transformerKva: number;
  ukPercent: number;
  copperLossKw: number;
  voltageFactor: number;
  upstreamShortCircuitMva: number | null;
  upstreamXOverR: number;
  cableLengthM: number;
  cableSectionMm2: number;
  material: 'Cu' | 'Al';
  conductorTempC: number;
  cableReactanceOhmsPerKm: number;
}

export interface ShortCircuitResult {
  initialSymmetricalCurrentA: number;
  peakCurrentA: number;
  peakFactor: number;
  totalResistanceOhms: number;
  totalReactanceOhms: number;
  totalImpedanceOhms: number;
  transformerImpedanceOhms: number;
}

const CONDUCTIVITY_20C = { Cu: 56, Al: 35 } as const;
const TEMP_COEFFICIENT = { Cu: 0.00393, Al: 0.00403 } as const;

export function calculateShortCircuit(inputs: ShortCircuitInputs): ShortCircuitResult | null {
  const {
    voltageV,
    transformerKva,
    ukPercent,
    copperLossKw,
    voltageFactor,
    upstreamShortCircuitMva,
    upstreamXOverR,
    cableLengthM,
    cableSectionMm2,
    material,
    conductorTempC,
    cableReactanceOhmsPerKm,
  } = inputs;

  const requiredPositive = [voltageV, transformerKva, ukPercent, voltageFactor];
  if (!requiredPositive.every((value) => Number.isFinite(value) && value > 0)) return null;
  if (!Number.isFinite(copperLossKw) || copperLossKw < 0) return null;
  if (!Number.isFinite(cableLengthM) || cableLengthM < 0) return null;
  if (!Number.isFinite(cableReactanceOhmsPerKm) || cableReactanceOhmsPerKm < 0) return null;
  if (!Number.isFinite(conductorTempC) || conductorTempC < -50 || conductorTempC > 250) return null;
  if (voltageFactor > 1.1) return null;
  if (upstreamShortCircuitMva !== null && (!Number.isFinite(upstreamShortCircuitMva) || upstreamShortCircuitMva <= 0)) return null;
  if (!Number.isFinite(upstreamXOverR) || upstreamXOverR <= 0) return null;
  if (cableLengthM > 0 && (!Number.isFinite(cableSectionMm2) || cableSectionMm2 <= 0)) return null;

  const transformerVa = transformerKva * 1000;
  const transformerRatedCurrent = transformerVa / (Math.sqrt(3) * voltageV);
  const transformerImpedanceOhms = (ukPercent / 100) * (voltageV * voltageV / transformerVa);
  const transformerResistanceOhms = (copperLossKw * 1000) / (3 * transformerRatedCurrent * transformerRatedCurrent);
  if (transformerResistanceOhms >= transformerImpedanceOhms) return null;
  const transformerReactanceOhms = Math.sqrt(
    transformerImpedanceOhms * transformerImpedanceOhms - transformerResistanceOhms * transformerResistanceOhms,
  );

  let sourceResistanceOhms = 0;
  let sourceReactanceOhms = 0;
  if (upstreamShortCircuitMva !== null) {
    const sourceImpedanceOhms = voltageV * voltageV / (upstreamShortCircuitMva * 1_000_000);
    sourceResistanceOhms = sourceImpedanceOhms / Math.sqrt(1 + upstreamXOverR * upstreamXOverR);
    sourceReactanceOhms = sourceResistanceOhms * upstreamXOverR;
  }

  let cableResistanceOhms = 0;
  let cableReactanceOhms = 0;
  if (cableLengthM > 0) {
    const resistanceAt20C = cableLengthM / (CONDUCTIVITY_20C[material] * cableSectionMm2);
    cableResistanceOhms = resistanceAt20C
      * (1 + TEMP_COEFFICIENT[material] * (conductorTempC - 20));
    cableReactanceOhms = cableReactanceOhmsPerKm * cableLengthM / 1000;
  }

  const totalResistanceOhms = transformerResistanceOhms + sourceResistanceOhms + cableResistanceOhms;
  const totalReactanceOhms = transformerReactanceOhms + sourceReactanceOhms + cableReactanceOhms;
  const totalImpedanceOhms = Math.hypot(totalResistanceOhms, totalReactanceOhms);
  if (totalImpedanceOhms <= 0) return null;

  const initialSymmetricalCurrentA = voltageFactor * voltageV / (Math.sqrt(3) * totalImpedanceOhms);
  const resistanceToReactanceRatio = totalReactanceOhms === 0
    ? Number.POSITIVE_INFINITY
    : totalResistanceOhms / totalReactanceOhms;
  const peakFactor = 1.02 + 0.98 * Math.exp(-3 * resistanceToReactanceRatio);

  return {
    initialSymmetricalCurrentA,
    peakCurrentA: Math.sqrt(2) * peakFactor * initialSymmetricalCurrentA,
    peakFactor,
    totalResistanceOhms,
    totalReactanceOhms,
    totalImpedanceOhms,
    transformerImpedanceOhms,
  };
}