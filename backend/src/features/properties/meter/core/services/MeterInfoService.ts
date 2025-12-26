import { IMeterInfoService } from '../interfaces/IMeterInfoService';
import { IMeterRepository } from '../interfaces/IMeterRepository';

export class MeterInfoService implements IMeterInfoService {
  constructor(private meterRepository: IMeterRepository) {}

  async getMeterById(id: string) {
    if (!id) throw new Error('Invalid meter ID');
    return await this.meterRepository.findById(id);
  }
}
