export const SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240] as const;

export const BASE_TABLE: Record<string, Record<string, number[]>> = {
  A1: {
    2: [14.5, 19.5, 26, 34, 46, 61, 80, 99, 119, 151, 182, 210, 240, 273, 321],
    3: [13.5, 18, 24, 31, 42, 56, 73, 89, 108, 136, 164, 188, 216, 245, 286],
  },
  B1: {
    2: [17.5, 24, 32, 41, 57, 76, 96, 119, 144, 184, 223, 259, 299, 341, 403],
    3: [15.5, 21, 28, 36, 50, 68, 89, 110, 134, 171, 207, 239, 262, 296, 346],
  },
  C: {
    2: [19.5, 27, 36, 46, 63, 85, 112, 138, 168, 213, 258, 299, 344, 392, 461],
    3: [17.5, 24, 32, 41, 57, 76, 96, 119, 144, 184, 223, 259, 299, 341, 403],
  },
};

export const TEMP_FACTORS: Record<string, number> = {
  10: 1.22,
  15: 1.17,
  20: 1.12,
  25: 1.06,
  30: 1.0,
  35: 0.94,
  40: 0.87,
  45: 0.79,
  50: 0.71,
  55: 0.61,
  60: 0.5,
};

export const GROUP_FACTORS: Record<string, number> = {
  1: 1.0,
  2: 0.8,
  3: 0.7,
  4: 0.65,
  5: 0.6,
  6: 0.57,
  7: 0.54,
  8: 0.52,
  9: 0.5,
  10: 0.48,
};

export const ALUMINUM_FACTOR = 0.78;

export interface CableSizingInputs {
  loadCurrent: number;
  conductors: '2' | '3';
  method: 'A1' | 'B1' | 'C';
  temp: string;
  group: string;
  material: 'Cu' | 'Al';
}

export interface CableSizingResult {
  section: number;
  iz: number;
  utilization: number;
  valid: boolean;
}

export function calculateCableSizing(inputs: CableSizingInputs): CableSizingResult | null {
  const { loadCurrent, conductors, method, temp, group, material } = inputs;

  if (!loadCurrent || loadCurrent <= 0) {
    return null;
  }

  const Ct = TEMP_FACTORS[String(temp)] ?? TEMP_FACTORS['30'];
  const Cg = GROUP_FACTORS[String(group)] ?? GROUP_FACTORS['1'];
  const Cm = material === 'Al' ? ALUMINUM_FACTOR : 1.0;
  const baseValues = BASE_TABLE[method]?.[conductors] ?? BASE_TABLE.B1['3'];

  for (let i = 0; i < SECTIONS.length; i++) {
    const candidateIz = baseValues[i] * Ct * Cg * Cm;
    if (candidateIz >= loadCurrent) {
      return { section: Number(SECTIONS[i]), iz: candidateIz, utilization: (loadCurrent / candidateIz) * 100, valid: true };
    }
  }

  return { section: 0, iz: 0, utilization: 0, valid: false };
}
