export type SystemType = 'DC' | '1' | '3';

export interface VoltageDropInputs {
  system: SystemType;
  voltage: number;
  current: number;
  lengthM: number;
  material: 'Cu' | 'Al';
  sectionMm2: number;
  tempC: number;
  reactanceOhmsPerKm: number;
  cosPhi: number | null;
}

export interface CalculationResult {
  deltaU: number;
  percent: number;
  finalVoltage: number;
  resistance: number;
  powerLoss: number;
  current: number;
  startVoltage?: number;
}
