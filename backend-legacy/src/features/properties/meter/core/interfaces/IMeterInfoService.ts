import { Meter } from '../types/meter.types';

export interface IMeterInfoService {
  /**
   * Returns meter info needed for billing/validation or null if not found
   */
  getMeterById(id: string): Promise<Meter | null>;
}
