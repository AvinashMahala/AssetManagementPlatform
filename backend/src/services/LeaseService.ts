import { ILeaseRepository } from '../interfaces/repositories/ILeaseRepository';
import { Lease, LeaseInput, LeaseStatus } from '../models/Lease';
import { ValidationUtils } from '../utils/validation';
import { ERROR_MESSAGES } from '../constants/validation';
import { ILeaseService } from '../interfaces/services/ILeaseService';

export class LeaseService implements ILeaseService {
  private repository: ILeaseRepository;

  constructor(repository: ILeaseRepository) {
    this.repository = repository;
  }

  async getAllLeases(): Promise<Lease[]> {
    return await this.repository.findAll();
  }

  async getLeaseById(id: string): Promise<Lease | null> {
    if (!id) {
      throw new Error('Lease ID is required');
    }
    return await this.repository.findById(id);
  }

  async getLeasesByProperty(propertyId: string): Promise<Lease[]> {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    return await this.repository.findByProperty(propertyId);
  }

  async getLeasesByTenant(tenantId: string): Promise<Lease[]> {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return await this.repository.findByTenant(tenantId);
  }

  async getActiveLeases(): Promise<Lease[]> {
    return await this.repository.findActiveLeases();
  }

  async getExpiringLeases(days: number): Promise<Lease[]> {
    if (days <= 0) {
      throw new Error('Days must be a positive number');
    }
    return await this.repository.findExpiringLeases(days);
  }

  async createLease(leaseData: LeaseInput): Promise<Lease> {
    // Validate lease data
    const validation = this.validateLeaseData(leaseData);
    if (!validation.isValid) {
      throw new Error(`Invalid lease data: ${validation.errors.join(', ')}`);
    }

    // Validate lease dates
    if (!this.validateLeaseDates(leaseData.startDate, leaseData.endDate)) {
      throw new Error('Invalid lease dates: end date must be after start date');
    }

    // Check property availability
    const isAvailable = await this.checkPropertyAvailability(
      leaseData.propertyId,
      leaseData.startDate,
      leaseData.endDate
    );
    if (!isAvailable) {
      throw new Error('Property is not available for the specified dates');
    }

    // Set default status if not provided
    const leaseInput = {
      ...leaseData,
      status: leaseData.status || LeaseStatus.DRAFT
    };

    return await this.repository.create(leaseInput);
  }

  async updateLease(id: string, leaseData: Partial<LeaseInput>): Promise<Lease | null> {
    if (!id) {
      throw new Error('Lease ID is required');
    }

    // Check if lease exists
    const existingLease = await this.repository.findById(id);
    if (!existingLease) {
      throw new Error('Lease not found');
    }

    // Validate lease data if provided
    if (leaseData.startDate || leaseData.endDate) {
      const startDate = leaseData.startDate || existingLease.startDate;
      const endDate = leaseData.endDate || existingLease.endDate;

      if (!this.validateLeaseDates(startDate, endDate)) {
        throw new Error('Invalid lease dates: end date must be after start date');
      }

      // Check property availability for date changes
      if (leaseData.startDate || leaseData.endDate) {
        const isAvailable = await this.checkPropertyAvailability(
          leaseData.propertyId || existingLease.propertyId,
          startDate,
          endDate
        );
        if (!isAvailable) {
          throw new Error('Property is not available for the specified dates');
        }
      }
    }

    return await this.repository.update(id, leaseData);
  }

  async deleteLease(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Lease ID is required');
    }

    // Check if lease exists
    const existingLease = await this.repository.findById(id);
    if (!existingLease) {
      throw new Error('Lease not found');
    }

    // Only allow deletion of draft leases
    if (existingLease.status !== LeaseStatus.DRAFT) {
      throw new Error('Only draft leases can be deleted');
    }

    return await this.repository.delete(id);
  }

  async terminateLease(id: string, terminationReason: string): Promise<boolean> {
    if (!id) {
      throw new Error('Lease ID is required');
    }
    if (!terminationReason?.trim()) {
      throw new Error('Termination reason is required');
    }

    // Check if lease exists
    const existingLease = await this.repository.findById(id);
    if (!existingLease) {
      throw new Error('Lease not found');
    }

    // Only allow termination of active leases
    if (existingLease.status !== LeaseStatus.ACTIVE) {
      throw new Error('Only active leases can be terminated');
    }

    return await this.repository.terminateLease(id, terminationReason);
  }

  async renewLease(id: string, newEndDate: Date): Promise<Lease | null> {
    if (!id) {
      throw new Error('Lease ID is required');
    }
    if (!newEndDate) {
      throw new Error('New end date is required');
    }

    // Check if lease exists
    const existingLease = await this.repository.findById(id);
    if (!existingLease) {
      throw new Error('Lease not found');
    }

    // Only allow renewal of active leases
    if (existingLease.status !== LeaseStatus.ACTIVE) {
      throw new Error('Only active leases can be renewed');
    }

    // Validate new end date is after current end date
    if (newEndDate <= existingLease.endDate) {
      throw new Error('New end date must be after current end date');
    }

    return await this.repository.renewLease(id, newEndDate);
  }

  validateLeaseDates(startDate: Date, endDate: Date): boolean {
    return endDate > startDate;
  }

  async checkPropertyAvailability(propertyId: string, startDate: Date, endDate: Date): Promise<boolean> {
    // Get all active leases for the property
    const activeLeases = await this.repository.findByProperty(propertyId);

    // Check for overlapping leases
    for (const lease of activeLeases) {
      if (lease.status === LeaseStatus.ACTIVE) {
        // Check if the date ranges overlap
        if (startDate < lease.endDate && endDate > lease.startDate) {
          return false;
        }
      }
    }

    return true;
  }

  calculateLeaseDuration(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();

    return years * 12 + months;
  }

  private validateLeaseData(leaseData: LeaseInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!leaseData.propertyId) {
      errors.push('Property ID is required');
    }
    if (!leaseData.tenantId) {
      errors.push('Tenant ID is required');
    }
    if (!leaseData.startDate) {
      errors.push('Start date is required');
    }
    if (!leaseData.endDate) {
      errors.push('End date is required');
    }
    if (leaseData.monthlyRent === undefined || leaseData.monthlyRent === null) {
      errors.push('Monthly rent is required');
    } else if (!ValidationUtils.isPositiveNumber(leaseData.monthlyRent)) {
      errors.push('Monthly rent must be a positive number');
    }
    if (leaseData.securityDeposit === undefined || leaseData.securityDeposit === null) {
      errors.push('Security deposit is required');
    } else if (!ValidationUtils.isPositiveNumber(leaseData.securityDeposit)) {
      errors.push('Security deposit must be a positive number');
    }

    // Validate optional numeric fields
    if (leaseData.noticePeriodDays !== undefined && !ValidationUtils.isPositiveNumber(leaseData.noticePeriodDays)) {
      errors.push('Notice period days must be a positive number');
    }
    if (leaseData.maintenanceCharges !== undefined && !ValidationUtils.isPositiveNumber(leaseData.maintenanceCharges)) {
      errors.push('Maintenance charges must be a positive number');
    }
    if (leaseData.rentDueDay !== undefined && (leaseData.rentDueDay < 1 || leaseData.rentDueDay > 31)) {
      errors.push('Rent due day must be between 1 and 31');
    }
    if (leaseData.electricityCharges !== undefined && !ValidationUtils.isPositiveNumber(leaseData.electricityCharges)) {
      errors.push('Electricity charges must be a positive number');
    }
    if (leaseData.waterCharges !== undefined && !ValidationUtils.isPositiveNumber(leaseData.waterCharges)) {
      errors.push('Water charges must be a positive number');
    }
    if (leaseData.otherCharges !== undefined && !ValidationUtils.isPositiveNumber(leaseData.otherCharges)) {
      errors.push('Other charges must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}