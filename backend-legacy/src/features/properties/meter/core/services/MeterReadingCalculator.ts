import { Meter } from '../types/meter.types';

export class MeterReadingCalculator {
  static validateAndCompute(meter: Meter | null, previousReading: number, currentReading: number) {
    if (!meter) throw new Error('Meter not found');
    if (currentReading < previousReading) throw new Error('Current reading cannot be less than previous reading');

    const unitsConsumed = currentReading - previousReading;
    const costPerUnit = meter.costPerUnit || 0;
    const fixedCharge = meter.fixedCharge || 0;
    const totalCost = (unitsConsumed * costPerUnit) + fixedCharge;

    return { unitsConsumed, totalCost };
  }
}
