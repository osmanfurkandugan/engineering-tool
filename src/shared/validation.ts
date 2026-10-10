export function parseNumber(value: number | string | undefined | null): number {
  if (value === undefined || value === null || value === '') {
    return Number.NaN;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function isPositiveNumber(value: number | string | undefined | null): boolean {
  const parsed = parseNumber(value);
  return Number.isFinite(parsed) && parsed > 0;
}

export function validatePowerFactor(value: number | string | undefined | null): boolean {
  const parsed = parseNumber(value);
  return Number.isFinite(parsed) && parsed >= 0.1 && parsed <= 1;
}
