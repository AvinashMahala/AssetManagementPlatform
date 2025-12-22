
import { IBaseRepository } from '@/shared/infrastructure/database/IBaseRepository';
import { RentPayment, CreateRentPaymentParams, UpdateRentPaymentParams, RentPaymentFilters } from './rent-payment.types';

export interface IRentPaymentRepository extends IBaseRepository<RentPayment, CreateRentPaymentParams, UpdateRentPaymentParams> {
  create(data: CreateRentPaymentParams): Promise<RentPayment>;
  update(id: string, data: UpdateRentPaymentParams): Promise<RentPayment | null>;
  findByLease(leaseId: string): Promise<RentPayment[]>;
  findByProperty(propertyId: string): Promise<RentPayment[]>;
  findByTenant(tenantId: string): Promise<RentPayment[]>;
  findPendingPayments(): Promise<RentPayment[]>;
  findOverduePayments(): Promise<RentPayment[]>;
  findPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]>;
}
