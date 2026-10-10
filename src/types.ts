export type SystemType = 'DC' | '1' | '3';

export interface CalculatorDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'live' | 'coming-soon';
  route: string;
}

export interface VoltageDropInputs {
  system: SystemType;
  voltage: number;
  current: number;
  lengthM: number;
  material: 'Cu' | 'Al';
  sectionMm2: number;
  tempC: number;
  x: number;
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
