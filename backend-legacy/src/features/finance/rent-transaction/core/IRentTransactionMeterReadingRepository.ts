import { RentTransactionMeterReading, RentTransactionMeterReadingInput } from './rent-transaction.types';

export interface IRentTransactionMeterReadingRepository {
  findByTransaction(transactionId: string): Promise<RentTransactionMeterReading[]>;
  findByMeter(meterId: string): Promise<RentTransactionMeterReading[]>;
  create(data: RentTransactionMeterReadingInput): Promise<RentTransactionMeterReading>;
  createBatch(data: RentTransactionMeterReadingInput[]): Promise<RentTransactionMeterReading[]>;
  deleteByTransaction(transactionId: string): Promise<boolean>;
}
