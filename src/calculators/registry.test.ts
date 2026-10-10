import { describe, expect, it } from 'vitest';
import { calculatorCatalog, findCalculatorByRoute } from './registry';

describe('calculator registry', () => {
  it('resolves each live calculator route to its component', () => {
    const liveCalculators = calculatorCatalog.filter((calculator) => calculator.status === 'live');

    expect(liveCalculators.length).toBeGreaterThan(0);
    for (const calculator of liveCalculators) {
      expect(findCalculatorByRoute(calculator.route)?.component).toBeTypeOf('function');
    }
  });

  it('keeps coming-soon routes discoverable without a component', () => {
    const comingSoon = findCalculatorByRoute('/power-factor');

    expect(comingSoon?.status).toBe('coming-soon');
    expect(comingSoon?.component).toBeNull();
  });
});