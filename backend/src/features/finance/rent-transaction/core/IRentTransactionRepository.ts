
import { IBaseRepository } from '@/shared/infrastructure/database/IBaseRepository';
import { RentTransaction, CreateRentTransactionParams, UpdateRentTransactionParams } from './rent-transaction.types';

export interface IRentTransactionRepository extends IBaseRepository<RentTransaction, CreateRentTransactionParams, UpdateRentTransactionParams> {
  create(data: CreateRentTransactionParams): Promise<RentTransaction>;
  update(id: string, data: UpdateRentTransactionParams): Promise<RentTransaction | null>;
  findByLease(leaseId: string): Promise<RentTransaction[]>;
  findByProperty(propertyId: string): Promise<RentTransaction[]>;
  findByTenant(tenantId: string): Promise<RentTransaction[]>;
  findByUnit(unitId: string): Promise<RentTransaction[]>;
}
