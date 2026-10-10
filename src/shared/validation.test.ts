import { describe, expect, it } from 'vitest';
import { validateEfficiency } from './validation';

describe('validateEfficiency', () => {
  it('accepts finite efficiency percentages above zero through 100', () => {
    expect(validateEfficiency(0.1)).toBe(true);
    expect(validateEfficiency(100)).toBe(true);
  });

  it('rejects zero, values above 100, and non-numeric values', () => {
    expect(validateEfficiency(0)).toBe(false);
    expect(validateEfficiency(100.1)).toBe(false);
    expect(validateEfficiency('')).toBe(false);
  });
});