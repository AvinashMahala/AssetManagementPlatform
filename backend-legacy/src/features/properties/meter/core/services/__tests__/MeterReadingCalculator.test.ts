import { MeterReadingCalculator } from '../MeterReadingCalculator';

describe('MeterReadingCalculator', () => {
  const meter = { costPerUnit: 2, fixedCharge: 10 } as any;

  it('computes units and total cost correctly', () => {
    const result = MeterReadingCalculator.validateAndCompute(meter, 100, 150);
    expect(result.unitsConsumed).toBe(50);
    expect(result.totalCost).toBe(50 * 2 + 10);
  });

  it('throws when meter is null', () => {
    expect(() => MeterReadingCalculator.validateAndCompute(null as any, 0, 10)).toThrow('Meter not found');
  });

  it('throws when current < previous', () => {
    expect(() => MeterReadingCalculator.validateAndCompute(meter, 200, 100)).toThrow('Current reading cannot be less than previous reading');
  });
});
