import { ITenantRepository } from '../interfaces/repositories/ITenantRepository.js';
import { Tenant, TenantInput, TenantDocument, TenantStatus, DocumentType } from '../models/Tenant.js';
import { ValidationUtils } from '../utils/validation.js';
import { ERROR_MESSAGES } from '../constants/validation.js';
import { ITenantService } from '../interfaces/services/ITenantService.js';

export class TenantService implements ITenantService {
  private repository: ITenantRepository;

  constructor(repository: ITenantRepository) {
    this.repository = repository;
  }

  async getAllTenants(): Promise<Tenant[]> {
    const tenants = await this.repository.findAll();
    // Populate documents for each tenant
    for (const tenant of tenants) {
      tenant.documents = await this.repository.getDocuments(tenant.id);
    }
    return tenants;
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    const tenant = await this.repository.findById(id);
    if (tenant) {
      tenant.documents = await this.repository.getDocuments(id);
    }
    return tenant;
  }

  async getTenantByEmail(email: string): Promise<Tenant | null> {
    const emailValidation = ValidationUtils.validateTenantEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }

    const tenant = await this.repository.findByEmail(email);
    if (tenant) {
      tenant.documents = await this.repository.getDocuments(tenant.id);
    }
    return tenant;
  }

  async getTenantByPhone(phone: string): Promise<Tenant | null> {
    const phoneValidation = ValidationUtils.validateTenantPhone(phone);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.message);
    }

    const tenant = await this.repository.findByPhone(phone);
    if (tenant) {
      tenant.documents = await this.repository.getDocuments(tenant.id);
    }
    return tenant;
  }

  async createTenant(tenantData: TenantInput): Promise<Tenant> {
    // Validate first name
    const firstNameValidation = ValidationUtils.validateTenantFirstName(tenantData.firstName);
    if (!firstNameValidation.isValid) {
      throw new Error(firstNameValidation.message);
    }

    // Validate last name
    const lastNameValidation = ValidationUtils.validateTenantLastName(tenantData.lastName || '');
    if (!lastNameValidation.isValid) {
      throw new Error(lastNameValidation.message);
    }

    // Validate email
    const emailValidation = ValidationUtils.validateTenantEmail(tenantData.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }

    // Check if email already exists
    const existingTenant = await this.repository.findByEmail(tenantData.email);
    if (existingTenant) {
      throw new Error(ERROR_MESSAGES.TENANT.EMAIL_EXISTS);
    }

    // Validate phone if provided
    if (tenantData.phone) {
      const phoneValidation = ValidationUtils.validateTenantPhone(tenantData.phone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }

      // Check if phone already exists
      const existingTenantByPhone = await this.repository.findByPhone(tenantData.phone);
      if (existingTenantByPhone) {
        throw new Error('Phone number already exists');
      }
    }

    // Validate monthly income
    const incomeValidation = ValidationUtils.validateTenantIncome(tenantData.monthlyIncome);
    if (!incomeValidation.isValid) {
      throw new Error(incomeValidation.message);
    }

    // Validate current address
    const currentAddressValidation = ValidationUtils.validateTenantAddress(tenantData.currentAddress);
    if (!currentAddressValidation.isValid) {
      throw new Error(currentAddressValidation.message);
    }

    // Validate permanent address if provided
    if (tenantData.permanentAddress) {
      const permanentAddressValidation = ValidationUtils.validateTenantAddress(tenantData.permanentAddress);
      if (!permanentAddressValidation.isValid) {
        throw new Error(permanentAddressValidation.message);
      }
    }

    // Validate emergency contact if provided
    if (tenantData.emergencyContact) {
      const emergencyContactValidation = ValidationUtils.validateEmergencyContact(tenantData.emergencyContact);
      if (!emergencyContactValidation.isValid) {
        throw new Error(emergencyContactValidation.message);
      }
    }

    // Ensure optional fields have proper defaults
    const tenantDataWithDefaults: Omit<Tenant, 'id' | 'documents' | 'createdAt' | 'updatedAt'> = {
      firstName: tenantData.firstName,
      lastName: tenantData.lastName,
      email: tenantData.email,
      phone: tenantData.phone,
      alternatePhone: tenantData.alternatePhone,
      dateOfBirth: tenantData.dateOfBirth,
      gender: tenantData.gender,
      occupation: tenantData.occupation,
      companyName: tenantData.companyName,
      monthlyIncome: tenantData.monthlyIncome,
      currentAddress: tenantData.currentAddress,
      permanentAddress: tenantData.permanentAddress,
      emergencyContact: tenantData.emergencyContact,
      status: (tenantData.status as TenantStatus) || TenantStatus.ACTIVE,
      totalRentals: 0,
    };

    return await this.repository.create(tenantDataWithDefaults);
  }

  async updateTenant(id: string, tenantData: Partial<TenantInput>): Promise<Tenant | null> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.TENANT.INVALID_ID);
    }

    // Validate fields if they are being updated
    if (tenantData.firstName !== undefined) {
      const firstNameValidation = ValidationUtils.validateTenantFirstName(tenantData.firstName);
      if (!firstNameValidation.isValid) {
        throw new Error(firstNameValidation.message);
      }
    }

    if (tenantData.lastName !== undefined) {
      const lastNameValidation = ValidationUtils.validateTenantLastName(tenantData.lastName || '');
      if (!lastNameValidation.isValid) {
        throw new Error(lastNameValidation.message);
      }
    }

    if (tenantData.email !== undefined) {
      const emailValidation = ValidationUtils.validateTenantEmail(tenantData.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }

      // Check if email already exists for another tenant
      const existingTenant = await this.repository.findByEmail(tenantData.email);
      if (existingTenant && existingTenant.id !== id) {
        throw new Error(ERROR_MESSAGES.TENANT.EMAIL_EXISTS);
      }
    }

    if (tenantData.phone !== undefined) {
      const phoneValidation = ValidationUtils.validateTenantPhone(tenantData.phone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }

      // Check if phone already exists for another tenant
      const existingTenant = await this.repository.findByPhone(tenantData.phone);
      if (existingTenant && existingTenant.id !== id) {
        throw new Error('Phone number already exists');
      }
    }

    if (tenantData.monthlyIncome !== undefined) {
      // Convert string to number if needed
      const income = typeof tenantData.monthlyIncome === 'string' 
        ? parseFloat(tenantData.monthlyIncome) 
        : tenantData.monthlyIncome;
      
      const incomeValidation = ValidationUtils.validateTenantIncome(income);
      if (!incomeValidation.isValid) {
        throw new Error(incomeValidation.message);
      }
      
      // Update the tenantData with the converted value
      tenantData.monthlyIncome = income;
    }

    if (tenantData.totalRentals !== undefined) {
      // Convert string to number if needed
      const totalRentals = typeof tenantData.totalRentals === 'string' 
        ? parseInt(tenantData.totalRentals, 10) 
        : tenantData.totalRentals;
      
      // Basic validation for totalRentals
      if (totalRentals < 0) {
        throw new Error('Total rentals cannot be negative');
      }
      
      // Update the tenantData with the converted value
      tenantData.totalRentals = totalRentals;
    }

    if (tenantData.currentAddress !== undefined) {
      const currentAddressValidation = ValidationUtils.validateTenantAddress(tenantData.currentAddress);
      if (!currentAddressValidation.isValid) {
        throw new Error(currentAddressValidation.message);
      }
    }

    if (tenantData.permanentAddress !== undefined) {
      const permanentAddressValidation = ValidationUtils.validateTenantAddress(tenantData.permanentAddress);
      if (!permanentAddressValidation.isValid) {
        throw new Error(permanentAddressValidation.message);
      }
    }

    if (tenantData.emergencyContact !== undefined) {
      const emergencyContactValidation = ValidationUtils.validateEmergencyContact(tenantData.emergencyContact);
      if (!emergencyContactValidation.isValid) {
        throw new Error(emergencyContactValidation.message);
      }
    }

    const updatedTenant = await this.repository.update(id, tenantData);
    if (updatedTenant) {
      updatedTenant.documents = await this.repository.getDocuments(id);
    }
    return updatedTenant;
  }

  async deleteTenant(id: string): Promise<boolean> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.TENANT.INVALID_ID);
    }

    return await this.repository.delete(id);
  }

  async updateTenantStatus(id: string, status: string): Promise<boolean> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.TENANT.INVALID_ID);
    }

    // Validate status
    const validStatuses = Object.values(TenantStatus);
    if (!validStatuses.includes(status as TenantStatus)) {
      throw new Error('Invalid tenant status');
    }

    return await this.repository.updateStatus(id, status);
  }

  // Document management methods
  async addTenantDocument(tenantId: string, document: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'>): Promise<TenantDocument> {
    const idValidation = ValidationUtils.validateId(tenantId);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.TENANT.INVALID_ID);
    }

    // Validate document type
    const validTypes = Object.values(DocumentType);
    if (!validTypes.includes(document.documentType as DocumentType)) {
      throw new Error('Invalid document type');
    }

    // Validate file URL
    if (!document.fileUrl || document.fileUrl.trim().length === 0) {
      throw new Error('Document file URL is required');
    }

    return await this.repository.addDocument(tenantId, document);
  }

  async getTenantDocuments(tenantId: string): Promise<TenantDocument[]> {
    const idValidation = ValidationUtils.validateId(tenantId);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.TENANT.INVALID_ID);
    }

    return await this.repository.getDocuments(tenantId);
  }

  async updateTenantDocument(documentId: string, data: Partial<TenantDocument>): Promise<TenantDocument | null> {
    const idValidation = ValidationUtils.validateId(documentId);
    if (!idValidation.isValid) {
      throw new Error('Invalid document ID');
    }

    if (data.documentType !== undefined) {
      const validTypes = Object.values(DocumentType);
      if (!validTypes.includes(data.documentType as DocumentType)) {
        throw new Error('Invalid document type');
      }
    }

    return await this.repository.updateDocument(documentId, data);
  }

  async deleteTenantDocument(documentId: string): Promise<boolean> {
    const idValidation = ValidationUtils.validateId(documentId);
    if (!idValidation.isValid) {
      throw new Error('Invalid document ID');
    }

    return await this.repository.deleteDocument(documentId);
  }

  async verifyTenantDocument(documentId: string, verifiedBy: string): Promise<boolean> {
    const documentIdValidation = ValidationUtils.validateId(documentId);
    if (!documentIdValidation.isValid) {
      throw new Error('Invalid document ID');
    }

    const verifiedByValidation = ValidationUtils.validateId(verifiedBy);
    if (!verifiedByValidation.isValid) {
      throw new Error('Invalid verifier ID');
    }

    const document = await this.repository.updateDocument(documentId, {
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: verifiedBy,
    });

    return document !== null;
  }
}