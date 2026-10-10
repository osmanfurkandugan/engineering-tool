export interface LoadCurrentInputs {
  powerValue: number;
  powerUnit: 'kW' | 'HP';
  system: '3' | '1';
  voltage: number;
  cosPhi: number;
  efficiency: number;
}

export interface LoadCurrentResult {
  current: number;
  inputPowerKw: number;
  suggestedRating: number;
}

const HP_TO_KW = 0.746;

export function calculateLoadCurrent(inputs: LoadCurrentInputs): LoadCurrentResult | null {
  const { powerValue, powerUnit, system, voltage, cosPhi, efficiency } = inputs;

  if (!powerValue || !voltage || !cosPhi || !efficiency) {
    return null;
  }

  const powerKw = powerUnit === 'HP' ? powerValue * HP_TO_KW : powerValue;
  const powerW = powerKw * 1000;
  const eta = efficiency / 100;

  const current = system === '3'
    ? powerW / (Math.sqrt(3) * voltage * cosPhi * eta)
    : powerW / (voltage * cosPhi * eta);

  return {
    current,
    inputPowerKw: powerKw / eta,
    suggestedRating: current * 1.25,
  };
}
