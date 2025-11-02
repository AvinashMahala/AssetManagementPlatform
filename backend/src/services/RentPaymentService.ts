import { IRentPaymentRepository } from '../interfaces/repositories/IRentPaymentRepository';
import { IRentPaymentService } from '../interfaces/services/IRentPaymentService';
import { RentPayment, RentPaymentInput, PaymentStatus, PaymentMethod } from '../models/RentPayment';
import { ValidationUtils } from '../utils/validation';
import { ERROR_MESSAGES } from '../constants/validation';
import { ILeaseRepository } from '../interfaces/repositories/ILeaseRepository';
import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository';
import { ITenantRepository } from '../interfaces/repositories/ITenantRepository';

export class RentPaymentService implements IRentPaymentService {
  private repository: IRentPaymentRepository;
  private leaseRepository: ILeaseRepository;
  private propertyRepository: IPropertyRepository;
  private tenantRepository: ITenantRepository;

  constructor(
    repository: IRentPaymentRepository,
    leaseRepository: ILeaseRepository,
    propertyRepository: IPropertyRepository,
    tenantRepository: ITenantRepository
  ) {
    this.repository = repository;
    this.leaseRepository = leaseRepository;
    this.propertyRepository = propertyRepository;
    this.tenantRepository = tenantRepository;
  }

  async getAllPayments(): Promise<RentPayment[]> {
    return await this.repository.findAll();
  }

  async getPaymentById(id: string): Promise<RentPayment | null> {
    if (!id) {
      throw new Error('Payment ID is required');
    }
    return await this.repository.findById(id);
  }

  async getPaymentsByLease(leaseId: string): Promise<RentPayment[]> {
    if (!leaseId) {
      throw new Error('Lease ID is required');
    }
    return await this.repository.findByLease(leaseId);
  }

  async getPaymentsByProperty(propertyId: string): Promise<RentPayment[]> {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    return await this.repository.findByProperty(propertyId);
  }

  async getPaymentsByTenant(tenantId: string): Promise<RentPayment[]> {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return await this.repository.findByTenant(tenantId);
  }

  async getPendingPayments(): Promise<RentPayment[]> {
    return await this.repository.findPendingPayments();
  }

  async getOverduePayments(): Promise<RentPayment[]> {
    return await this.repository.findOverduePayments();
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]> {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }
    return await this.repository.findPaymentsByDateRange(startDate, endDate);
  }

  async createPayment(paymentData: RentPaymentInput): Promise<RentPayment> {
    // Validate payment data
    const validation = this.validatePaymentData(paymentData);
    if (!validation.isValid) {
      throw new Error(`Invalid payment data: ${validation.errors.join(', ')}`);
    }

    // Verify lease exists
    const lease = await this.leaseRepository.findById(paymentData.leaseId);
    if (!lease) {
      throw new Error('Lease not found');
    }

    // Verify property exists
    const property = await this.propertyRepository.findById(paymentData.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Verify tenant exists
    const tenant = await this.tenantRepository.findById(parseInt(paymentData.tenantId));
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Calculate total amount if not provided
    const totalAmount = paymentData.amount ||
      (paymentData.rentAmount + (paymentData.maintenanceCharges || 0) + (paymentData.otherCharges || 0) + (paymentData.lateFee || 0) + (paymentData.penaltyAmount || 0));

    const paymentInput = {
      ...paymentData,
      amount: totalAmount,
      status: paymentData.status || PaymentStatus.PENDING
    } as RentPaymentInput;

    return await this.repository.create(paymentInput);
  }

  async updatePayment(id: string, paymentData: Partial<RentPaymentInput>): Promise<RentPayment | null> {
    if (!id) {
      throw new Error('Payment ID is required');
    }

    // Check if payment exists
    const existingPayment = await this.repository.findById(id);
    if (!existingPayment) {
      throw new Error('Payment not found');
    }

    // Validate payment data if provided
    if (Object.keys(paymentData).length > 0) {
      const validation = this.validatePaymentData(paymentData as RentPaymentInput, true);
      if (!validation.isValid) {
        throw new Error(`Invalid payment data: ${validation.errors.join(', ')}`);
      }
    }

    // Recalculate total amount if any amount components changed
    let updatedData = { ...paymentData };
    if (paymentData.rentAmount !== undefined || paymentData.maintenanceCharges !== undefined ||
        paymentData.otherCharges !== undefined || paymentData.lateFee !== undefined ||
        paymentData.penaltyAmount !== undefined) {
      const rentAmount = paymentData.rentAmount !== undefined ? paymentData.rentAmount : existingPayment.rentAmount;
      const maintenanceCharges = paymentData.maintenanceCharges !== undefined ? paymentData.maintenanceCharges : (existingPayment.maintenanceCharges || 0);
      const otherCharges = paymentData.otherCharges !== undefined ? paymentData.otherCharges : (existingPayment.otherCharges || 0);
      const lateFee = paymentData.lateFee !== undefined ? paymentData.lateFee : (existingPayment.lateFee || 0);
      const penaltyAmount = paymentData.penaltyAmount !== undefined ? paymentData.penaltyAmount : (existingPayment.penaltyAmount || 0);

      updatedData.amount = rentAmount + maintenanceCharges + otherCharges + lateFee + penaltyAmount;
    }

    return await this.repository.update(id, updatedData);
  }

  async deletePayment(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Payment ID is required');
    }

    // Check if payment exists
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Only allow deletion of pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be deleted');
    }

    return await this.repository.delete(id);
  }

  async markPaymentAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean> {
    if (!id) {
      throw new Error('Payment ID is required');
    }

    if (!paidDate) {
      throw new Error('Paid date is required');
    }

    // Check if payment exists
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Validate payment method if provided
    if (paymentMethod && !Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)) {
      throw new Error('Invalid payment method');
    }

    return await this.repository.markAsPaid(id, paidDate, paymentMethod, transactionId);
  }

  calculateLateFees(amount: number, dueDate: Date, paidDate?: Date): number {
    if (!dueDate) {
      throw new Error('Due date is required');
    }

    const paymentDate = paidDate || new Date();
    if (paymentDate <= dueDate) {
      return 0; // No late fee if paid on or before due date
    }

    // Calculate days late
    const daysLate = Math.ceil((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    // Simple late fee calculation: $50 per day (can be made configurable)
    const lateFeePerDay = 50;
    return daysLate * lateFeePerDay;
  }

  async generateMonthlyPayments(leaseId: string, startDate: Date, endDate: Date): Promise<RentPayment[]> {
    if (!leaseId) {
      throw new Error('Lease ID is required');
    }

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }

    // Get lease details
    const lease = await this.leaseRepository.findById(leaseId);
    if (!lease) {
      throw new Error('Lease not found');
    }

    const payments: RentPayment[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Calculate due date (use rent due day from lease or default to 1st)
      const dueDay = lease.rentDueDay || 1;
      const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dueDay);

      // Skip if due date is after lease end date
      if (dueDate > lease.endDate) {
        break;
      }

      // Calculate amount breakdown
      const rentAmount = lease.monthlyRent;
      const maintenanceCharges = lease.maintenanceCharges || 0;
      const otherCharges = (lease.electricityCharges || 0) + (lease.waterCharges || 0) + (lease.otherCharges || 0);
      const totalAmount = rentAmount + maintenanceCharges + otherCharges;

      const paymentInput: RentPaymentInput = {
        leaseId: lease.id,
        propertyId: lease.propertyId,
        tenantId: lease.tenantId,
        amount: totalAmount,
        dueDate: dueDate,
        status: PaymentStatus.PENDING,
        rentAmount: rentAmount,
        maintenanceCharges: maintenanceCharges > 0 ? maintenanceCharges : undefined,
        otherCharges: otherCharges > 0 ? otherCharges : undefined,
        createdBy: 'system' // This should be the current user ID
      };

      const payment = await this.repository.create(paymentInput);
      payments.push(payment);

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return payments;
  }

  async getTotalRevenueByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<number> {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    return await this.repository.getTotalRevenueByProperty(propertyId, startDate, endDate);
  }

  async getTotalRevenueByOwner(ownerId: string, startDate?: Date, endDate?: Date): Promise<number> {
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    // Get all properties owned by this owner
    const properties = await this.propertyRepository.findByOwner(ownerId);
    const propertyIds = properties.map(p => p.id);

    if (propertyIds.length === 0) {
      return 0;
    }

    // Sum revenue from all properties
    let totalRevenue = 0;
    for (const propertyId of propertyIds) {
      totalRevenue += await this.repository.getTotalRevenueByProperty(propertyId, startDate, endDate);
    }

    return totalRevenue;
  }

  async getOutstandingPayments(): Promise<number> {
    const pendingPayments = await this.repository.findPendingPayments();
    const overduePayments = await this.repository.findOverduePayments();

    const allOutstanding = [...pendingPayments, ...overduePayments];
    return allOutstanding.reduce((total, payment) => total + payment.amount, 0);
  }

  async getMonthlyRevenueReport(year: number, month: number): Promise<any> {
    if (!year || !month) {
      throw new Error('Year and month are required');
    }

    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    return await this.repository.getMonthlyRevenueReport(undefined, year, month);
  }

  private validatePaymentData(paymentData: RentPaymentInput, isPartial: boolean = false): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields (skip for partial updates)
    if (!isPartial) {
      if (!paymentData.leaseId) {
        errors.push('Lease ID is required');
      }
      if (!paymentData.propertyId) {
        errors.push('Property ID is required');
      }
      if (!paymentData.tenantId) {
        errors.push('Tenant ID is required');
      }
      if (!paymentData.dueDate) {
        errors.push('Due date is required');
      }
      if (!paymentData.createdBy) {
        errors.push('Created by is required');
      }
    }

    // Validate lease ID
    if (paymentData.leaseId !== undefined) {
      const leaseValidation = ValidationUtils.validateRentPaymentLeaseId(paymentData.leaseId);
      if (!leaseValidation.isValid) {
        errors.push(leaseValidation.message || 'Invalid lease ID');
      }
    }

    // Validate amount
    if (paymentData.amount !== undefined) {
      const amountValidation = ValidationUtils.validateRentPaymentAmount(paymentData.amount);
      if (!amountValidation.isValid) {
        errors.push(amountValidation.message || 'Invalid amount');
      }
    }

    // Validate due date
    if (paymentData.dueDate !== undefined) {
      const dueDateValidation = ValidationUtils.validateRentPaymentDueDate(paymentData.dueDate);
      if (!dueDateValidation.isValid) {
        errors.push(dueDateValidation.message || 'Invalid due date');
      }
    }

    // Validate late fee
    if (paymentData.lateFee !== undefined) {
      const lateFeeValidation = ValidationUtils.validateRentPaymentLateFee(paymentData.lateFee);
      if (!lateFeeValidation.isValid) {
        errors.push(lateFeeValidation.message || 'Invalid late fee');
      }
    }

    // Validate rent amount
    if (paymentData.rentAmount !== undefined) {
      const rentValidation = ValidationUtils.validateRentPaymentAmount(paymentData.rentAmount);
      if (!rentValidation.isValid) {
        errors.push('Invalid rent amount');
      }
    }

    // Validate maintenance charges
    if (paymentData.maintenanceCharges !== undefined) {
      const maintenanceValidation = ValidationUtils.validateRentPaymentLateFee(paymentData.maintenanceCharges);
      if (!maintenanceValidation.isValid) {
        errors.push('Invalid maintenance charges');
      }
    }

    // Validate other charges
    if (paymentData.otherCharges !== undefined) {
      const otherValidation = ValidationUtils.validateRentPaymentLateFee(paymentData.otherCharges);
      if (!otherValidation.isValid) {
        errors.push('Invalid other charges');
      }
    }

    // Validate penalty amount
    if (paymentData.penaltyAmount !== undefined) {
      const penaltyValidation = ValidationUtils.validateRentPaymentLateFee(paymentData.penaltyAmount);
      if (!penaltyValidation.isValid) {
        errors.push('Invalid penalty amount');
      }
    }

    // Validate payment method
    if (paymentData.paymentMethod !== undefined && !Object.values(PaymentMethod).includes(paymentData.paymentMethod)) {
      errors.push('Invalid payment method');
    }

    // Validate status
    if (paymentData.status !== undefined && !Object.values(PaymentStatus).includes(paymentData.status)) {
      errors.push('Invalid payment status');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}