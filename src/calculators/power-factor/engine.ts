export interface PowerFactorInputs {
  activePowerKw: number;
  system: '1' | '3';
  voltageV: number;
  initialPowerFactor: number;
  targetPowerFactor: number;
}

export interface PowerFactorResult {
  requiredCapacitorKvar: number;
  initialReactivePowerKvar: number;
  targetReactivePowerKvar: number;
  initialCurrentA: number;
  targetCurrentA: number;
  currentReductionPercent: number;
}

export function calculatePowerFactorCorrection(inputs: PowerFactorInputs): PowerFactorResult | null {
  const { activePowerKw, system, voltageV, initialPowerFactor, targetPowerFactor } = inputs;

  if (![activePowerKw, voltageV, initialPowerFactor, targetPowerFactor].every(Number.isFinite)) return null;
  if (activePowerKw <= 0 || voltageV <= 0) return null;
  if (initialPowerFactor < 0.1 || initialPowerFactor > 1) return null;
  if (targetPowerFactor <= initialPowerFactor || targetPowerFactor > 1) return null;
  if (system !== '1' && system !== '3') return null;

  const initialReactivePowerKvar = activePowerKw * Math.tan(Math.acos(initialPowerFactor));
  const targetReactivePowerKvar = activePowerKw * Math.tan(Math.acos(targetPowerFactor));
  const requiredCapacitorKvar = initialReactivePowerKvar - targetReactivePowerKvar;
  const phaseFactor = system === '3' ? Math.sqrt(3) : 1;
  const initialCurrentA = activePowerKw * 1000 / (phaseFactor * voltageV * initialPowerFactor);
  const targetCurrentA = activePowerKw * 1000 / (phaseFactor * voltageV * targetPowerFactor);

  return {
    requiredCapacitorKvar,
    initialReactivePowerKvar,
    targetReactivePowerKvar,
    initialCurrentA,
    targetCurrentA,
    currentReductionPercent: ((initialCurrentA - targetCurrentA) / initialCurrentA) * 100,
  };
}