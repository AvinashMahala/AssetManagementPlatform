import { Pool } from 'pg';
import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { ITenantRepository } from '../interfaces/repositories/ITenantRepository';
import { IUnitRepository } from '../interfaces/repositories/IUnitRepository';
import { IUnitTenantRepository } from '../interfaces/repositories/IUnitTenantRepository';
import { IPropertyService } from '../interfaces/services/IPropertyService';
import { IUserService } from '../interfaces/services/IUserService';
import { ITenantService } from '../interfaces/services/ITenantService';
import { IUnitService } from '../interfaces/services/IUnitService';
import { IUnitTenantService } from '../interfaces/services/IUnitTenantService';
import { PropertyRepository } from '../repositories/PropertyRepository';
import { UserRepository } from '../repositories/UserRepository';
import { TenantRepository } from '../repositories/TenantRepository';
import { PasswordResetMethodRepository } from '../repositories/PasswordResetMethodRepository';
import { SecurityQuestionRepository } from '../repositories/SecurityQuestionRepository';
import { RecoveryCodeRepository } from '../repositories/RecoveryCodeRepository';
import { UnitRepository } from '../repositories/UnitRepository';
import { UnitTenantRepository } from '../repositories/UnitTenantRepository';
import { PropertyService } from '../services/PropertyService';
import { UserService } from '../services/UserService';
import { TenantService } from '../services/TenantService';
import { PasswordResetService } from '../services/PasswordResetService';
import { UnitService } from '../services/UnitService';
import { UnitTenantService } from '../services/UnitTenantService';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private pool: Pool;

  // Repositories
  private _propertyRepository: IPropertyRepository | null = null;
  private _userRepository: IUserRepository | null = null;
  private _tenantRepository: ITenantRepository | null = null;
  private _unitRepository: IUnitRepository | null = null;
  private _unitTenantRepository: IUnitTenantRepository | null = null;
  private _passwordResetMethodRepository: PasswordResetMethodRepository | null = null;
  private _securityQuestionRepository: SecurityQuestionRepository | null = null;
  private _recoveryCodeRepository: RecoveryCodeRepository | null = null;

  // Services
  private _propertyService: IPropertyService | null = null;
  private _userService: IUserService | null = null;
  private _tenantService: ITenantService | null = null;
  private _unitService: IUnitService | null = null;
  private _unitTenantService: IUnitTenantService | null = null;
  private _passwordResetService: PasswordResetService | null = null;

  private constructor(pool: Pool) {
    this.pool = pool;
  }

  public static initialize(pool: Pool): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer(pool);
    }
    return DependencyContainer.instance;
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      throw new Error('DependencyContainer not initialized. Call initialize() first.');
    }
    return DependencyContainer.instance;
  }

  // Repository getters with lazy initialization
  public get propertyRepository(): IPropertyRepository {
    if (!this._propertyRepository) {
      this._propertyRepository = new PropertyRepository(this.pool);
    }
    return this._propertyRepository;
  }

  public get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(this.pool);
    }
    return this._userRepository;
  }

  public get tenantRepository(): ITenantRepository {
    if (!this._tenantRepository) {
      this._tenantRepository = new TenantRepository(this.pool);
    }
    return this._tenantRepository;
  }

  public get passwordResetMethodRepository(): PasswordResetMethodRepository {
    if (!this._passwordResetMethodRepository) {
      this._passwordResetMethodRepository = new PasswordResetMethodRepository(this.pool);
    }
    return this._passwordResetMethodRepository;
  }

  public get securityQuestionRepository(): SecurityQuestionRepository {
    if (!this._securityQuestionRepository) {
      this._securityQuestionRepository = new SecurityQuestionRepository(this.pool);
    }
    return this._securityQuestionRepository;
  }

  public get recoveryCodeRepository(): RecoveryCodeRepository {
    if (!this._recoveryCodeRepository) {
      this._recoveryCodeRepository = new RecoveryCodeRepository(this.pool);
    }
    return this._recoveryCodeRepository;
  }

  public get unitRepository(): IUnitRepository {
    if (!this._unitRepository) {
      this._unitRepository = new UnitRepository(this.pool);
    }
    return this._unitRepository;
  }

  public get unitTenantRepository(): IUnitTenantRepository {
    if (!this._unitTenantRepository) {
      this._unitTenantRepository = new UnitTenantRepository(this.pool);
    }
    return this._unitTenantRepository;
  }

  // Service getters with lazy initialization
  public get propertyService(): IPropertyService {
    if (!this._propertyService) {
      this._propertyService = new PropertyService(this.propertyRepository);
    }
    return this._propertyService;
  }

  public get userService(): IUserService {
    if (!this._userService) {
      this._userService = new UserService(this.userRepository);
    }
    return this._userService;
  }

  public get tenantService(): ITenantService {
    if (!this._tenantService) {
      this._tenantService = new TenantService(this.tenantRepository);
    }
    return this._tenantService;
  }

  public get passwordResetService(): PasswordResetService {
    if (!this._passwordResetService) {
      this._passwordResetService = new PasswordResetService(
        this.passwordResetMethodRepository,
        this.securityQuestionRepository,
        this.recoveryCodeRepository,
        this.userRepository
      );
    }
    return this._passwordResetService;
  }

  public get unitService(): IUnitService {
    if (!this._unitService) {
      this._unitService = new UnitService(this.unitRepository);
    }
    return this._unitService;
  }

  public get unitTenantService(): IUnitTenantService {
    if (!this._unitTenantService) {
      this._unitTenantService = new UnitTenantService(this.unitTenantRepository);
    }
    return this._unitTenantService;
  }

  // Method to register custom implementations (for testing)
  public registerPropertyRepository(repository: IPropertyRepository): void {
    this._propertyRepository = repository;
  }

  public registerUserRepository(repository: IUserRepository): void {
    this._userRepository = repository;
  }

  public registerTenantRepository(repository: ITenantRepository): void {
    this._tenantRepository = repository;
  }

  public registerPropertyService(service: IPropertyService): void {
    this._propertyService = service;
  }

  public registerUserService(service: IUserService): void {
    this._userService = service;
  }

  public registerTenantService(service: ITenantService): void {
    this._tenantService = service;
  }

  public registerUnitRepository(repository: IUnitRepository): void {
    this._unitRepository = repository;
  }

  public registerUnitTenantRepository(repository: IUnitTenantRepository): void {
    this._unitTenantRepository = repository;
  }

  public registerUnitService(service: IUnitService): void {
    this._unitService = service;
  }

  public registerUnitTenantService(service: IUnitTenantService): void {
    this._unitTenantService = service;
  }

    // Reset method for testing
  public reset(): void {
    this._propertyRepository = null;
    this._userRepository = null;
    this._tenantRepository = null;
    this._unitRepository = null;
    this._unitTenantRepository = null;
    this._passwordResetMethodRepository = null;
    this._securityQuestionRepository = null;
    this._recoveryCodeRepository = null;
    this._propertyService = null;
    this._userService = null;
    this._tenantService = null;
    this._unitService = null;
    this._unitTenantService = null;
    this._passwordResetService = null;
  }
}