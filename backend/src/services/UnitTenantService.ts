import { IUnitTenantRepository } from '../interfaces/repositories/IUnitTenantRepository.js';
import { UnitTenant, UnitTenantInput } from '../models/Unit.js';
import { ValidationUtils } from '@/shared/utils/validation.js';
import { ERROR_MESSAGES } from '@/shared/constants/validation.js';
import { IUnitTenantService } from '../interfaces/services/IUnitTenantService.js';

export class UnitTenantService implements IUnitTenantService {
  private repository: IUnitTenantRepository;

  constructor(repository: IUnitTenantRepository) {
    this.repository = repository;
  }

  async getAllAssignments(): Promise<UnitTenant[]> {
    return await this.repository.findAll();
  }

  async getAssignmentById(id: string): Promise<UnitTenant | null> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT_TENANT.INVALID_ID);
    }
    return await this.repository.findById(id);
  }

  async getTenantsByUnit(unitId: string): Promise<UnitTenant[]> {
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }
    return await this.repository.findByUnitId(unitId);
  }

  async getUnitsByTenant(tenantId: string): Promise<UnitTenant[]> {
    const tenantValidation = ValidationUtils.validateUnitTenantTenantId(tenantId);
    if (!tenantValidation.isValid) {
      throw new Error(tenantValidation.message);
    }
    return await this.repository.findByTenantId(tenantId);
  }

  async assignTenantToUnit(assignmentData: UnitTenantInput): Promise<UnitTenant> {
    // Validate unit ID
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(assignmentData.unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    // Validate tenant ID
    const tenantValidation = ValidationUtils.validateUnitTenantTenantId(assignmentData.tenantId);
    if (!tenantValidation.isValid) {
      throw new Error(tenantValidation.message);
    }

    // Validate rent share
    const rentShareValidation = ValidationUtils.validateUnitTenantRentShare(assignmentData.monthlyRentShare);
    if (!rentShareValidation.isValid) {
      throw new Error(rentShareValidation.message);
    }

    // Validate security deposit share
    const depositShareValidation = ValidationUtils.validateUnitTenantSecurityDepositShare(assignmentData.securityDepositShare);
    if (!depositShareValidation.isValid) {
      throw new Error(depositShareValidation.message);
    }

    // Validate status
    if (assignmentData.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitTenantStatus(assignmentData.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    return await this.repository.create(assignmentData);
  }

  async removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean> {
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    const tenantValidation = ValidationUtils.validateUnitTenantTenantId(tenantId);
    if (!tenantValidation.isValid) {
      throw new Error(tenantValidation.message);
    }

    return await this.repository.deleteByUnitAndTenant(unitId, tenantId);
  }

  async updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null> {
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    const tenantValidation = ValidationUtils.validateUnitTenantTenantId(tenantId);
    if (!tenantValidation.isValid) {
      throw new Error(tenantValidation.message);
    }

    // Validate fields if they are being updated
    if (updates.monthlyRentShare !== undefined) {
      const rentShareValidation = ValidationUtils.validateUnitTenantRentShare(updates.monthlyRentShare);
      if (!rentShareValidation.isValid) {
        throw new Error(rentShareValidation.message);
      }
    }

    if (updates.securityDepositShare !== undefined) {
      const depositShareValidation = ValidationUtils.validateUnitTenantSecurityDepositShare(updates.securityDepositShare);
      if (!depositShareValidation.isValid) {
        throw new Error(depositShareValidation.message);
      }
    }

    if (updates.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitTenantStatus(updates.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    // Find the assignment first
    const assignments = await this.repository.findByUnitId(unitId);
    const assignment = assignments.find(a => a.tenantId === tenantId);

    if (!assignment) {
      return null;
    }

    return await this.repository.update(assignment.id, updates);
  }
}