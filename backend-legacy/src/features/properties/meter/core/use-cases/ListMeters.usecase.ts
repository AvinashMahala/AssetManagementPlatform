import { IUseCase } from '@/shared/core/IUseCase';
import { IMeterRepository } from '../interfaces/IMeterRepository';
import { Meter } from '../types/meter.types';

export class ListMeters implements IUseCase<void, Meter[]> {
  constructor(private readonly repository: IMeterRepository) {}

  async execute(): Promise<Meter[]> {
    return this.repository.findAll();
  }
}
