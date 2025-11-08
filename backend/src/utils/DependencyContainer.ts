import { Pool } from 'pg';
import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { ITenantRepository } from '../interfaces/repositories/ITenantRepository';
import { IUnitRepository } from '../interfaces/repositories/IUnitRepository';
import { IUnitTenantRepository } from '../interfaces/repositories/IUnitTenantRepository';
import { ILeaseRepository } from '../interfaces/repositories/ILeaseRepository';
import { IRentPaymentRepository } from '../interfaces/repositories/IRentPaymentRepository';
import { IRentTransactionRepository } from '../interfaces/repositories/IRentTransactionRepository';
import { IMeterRepository, IMeterReadingRepository } from '../interfaces/repositories/IMeterRepository';
import { IMeterService, IMeterReadingService } from '../interfaces/services/IMeterService';
import { IUserService } from '../interfaces/services/IUserService';
import { ITenantService } from '../interfaces/services/ITenantService';
import { IUnitService } from '../interfaces/services/IUnitService';
import { IUnitTenantService } from '../interfaces/services/IUnitTenantService';
import { ILeaseService } from '../interfaces/services/ILeaseService';
import { IRentPaymentService } from '../interfaces/services/IRentPaymentService';
import { IRentTransactionService } from '../interfaces/services/IRentTransactionService';
import { IPropertyService } from '../interfaces/services/IPropertyService';
import { IReceiptRepository } from '../interfaces/repositories/IReceiptRepository';
import { IReceiptService } from '../interfaces/repositories/IReceiptRepository';
import { IUnitUtilityRepository } from '../interfaces/repositories/IUnitUtilityRepository';
import { IUnitUtilityService } from '../interfaces/services/IUnitUtilityService';
import { PropertyRepository } from '../repositories/PropertyRepository';
import { UserRepository } from '../repositories/UserRepository';
import { TenantRepository } from '../repositories/TenantRepository';
import { PasswordResetMethodRepository } from '../repositories/PasswordResetMethodRepository';
import { SecurityQuestionRepository } from '../repositories/SecurityQuestionRepository';
import { RecoveryCodeRepository } from '../repositories/RecoveryCodeRepository';
import { UnitRepository } from '../repositories/UnitRepository';
import { UnitTenantRepository } from '../repositories/UnitTenantRepository';
import { LeaseRepository } from '../repositories/LeaseRepository';
import { RentPaymentRepository } from '../repositories/RentPaymentRepository';
import { RentTransactionRepository } from '../repositories/RentTransactionRepository';
import { MeterRepository } from '../repositories/MeterRepository';
import { MeterReadingRepository } from '../repositories/MeterReadingRepository';
import { ReceiptRepository } from '../repositories/ReceiptRepository';
import { ReceiptTemplateRepository } from '../repositories/ReceiptTemplateRepository';
import { RentTransactionMeterReadingRepository, IRentTransactionMeterReadingRepository } from '../repositories/RentTransactionMeterReadingRepository';
import { UnitUtilityRepository } from '../repositories/UnitUtilityRepository';
import { PropertyService } from '../services/PropertyService';
import { UserService } from '../services/UserService';
import { TenantService } from '../services/TenantService';
import { PasswordResetService } from '../services/PasswordResetService';
import { UnitService } from '../services/UnitService';
import { UnitTenantService } from '../services/UnitTenantService';
import { LeaseService } from '../services/LeaseService';
import { RentPaymentService } from '../services/RentPaymentService';
import { RentTransactionService } from '../services/RentTransactionService';
import { MeterService } from '../services/MeterService';
import { MeterReadingService } from '../services/MeterReadingService';
import { ReceiptService } from '../services/ReceiptService';
import { ReceiptTemplateService } from '../services/ReceiptTemplateService';
import { UnitUtilityService } from '../services/UnitUtilityService';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private pool: Pool;

  // Repositories
  private _propertyRepository: IPropertyRepository | null = null;
  private _userRepository: IUserRepository | null = null;
  private _tenantRepository: ITenantRepository | null = null;
  private _unitRepository: IUnitRepository | null = null;
  private _unitTenantRepository: IUnitTenantRepository | null = null;
  private _leaseRepository: ILeaseRepository | null = null;
  private _rentPaymentRepository: IRentPaymentRepository | null = null;
  private _rentTransactionRepository: IRentTransactionRepository | null = null;
  private _meterRepository: IMeterRepository | null = null;
  private _meterReadingRepository: IMeterReadingRepository | null = null;
  private _receiptRepository: IReceiptRepository | null = null;
  private _transactionMeterReadingRepository: IRentTransactionMeterReadingRepository | null = null;
  private _passwordResetMethodRepository: PasswordResetMethodRepository | null = null;
  private _securityQuestionRepository: SecurityQuestionRepository | null = null;
  private _recoveryCodeRepository: RecoveryCodeRepository | null = null;
  private _receiptTemplateRepository: ReceiptTemplateRepository | null = null;
  private _unitUtilityRepository: IUnitUtilityRepository | null = null;

  // Services
  private _propertyService: IPropertyService | null = null;
  private _userService: IUserService | null = null;
  private _tenantService: ITenantService | null = null;
  private _unitService: IUnitService | null = null;
  private _unitTenantService: IUnitTenantService | null = null;
  private _leaseService: ILeaseService | null = null;
  private _rentPaymentService: IRentPaymentService | null = null;
  private _rentTransactionService: IRentTransactionService | null = null;
  private _meterService: IMeterService | null = null;
  private _meterReadingService: IMeterReadingService | null = null;
  private _receiptService: IReceiptService | null = null;
  private _passwordResetService: PasswordResetService | null = null;
  private _receiptTemplateService: ReceiptTemplateService | null = null;
  private _unitUtilityService: IUnitUtilityService | null = null;

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

  public get leaseRepository(): ILeaseRepository {
    if (!this._leaseRepository) {
      this._leaseRepository = new LeaseRepository(this.pool);
    }
    return this._leaseRepository;
  }

  public get rentPaymentRepository(): IRentPaymentRepository {
    if (!this._rentPaymentRepository) {
      this._rentPaymentRepository = new RentPaymentRepository(this.pool);
    }
    return this._rentPaymentRepository;
  }

  public get rentTransactionRepository(): IRentTransactionRepository {
    if (!this._rentTransactionRepository) {
      this._rentTransactionRepository = new RentTransactionRepository(this.pool);
    }
    return this._rentTransactionRepository;
  }

  public get meterRepository(): IMeterRepository {
    if (!this._meterRepository) {
      this._meterRepository = new MeterRepository(this.pool);
    }
    return this._meterRepository;
  }

  public get meterReadingRepository(): IMeterReadingRepository {
    if (!this._meterReadingRepository) {
      this._meterReadingRepository = new MeterReadingRepository(this.pool);
    }
    return this._meterReadingRepository;
  }

  public get receiptRepository(): IReceiptRepository {
    if (!this._receiptRepository) {
      this._receiptRepository = new ReceiptRepository(this.pool);
    }
    return this._receiptRepository;
  }

  public get receiptTemplateRepository(): ReceiptTemplateRepository {
    if (!this._receiptTemplateRepository) {
      this._receiptTemplateRepository = new ReceiptTemplateRepository(this.pool);
    }
    return this._receiptTemplateRepository;
  }

  public get unitUtilityRepository(): IUnitUtilityRepository {
    if (!this._unitUtilityRepository) {
      this._unitUtilityRepository = new UnitUtilityRepository(this.pool);
    }
    return this._unitUtilityRepository;
  }

  public get transactionMeterReadingRepository(): IRentTransactionMeterReadingRepository {
    if (!this._transactionMeterReadingRepository) {
      this._transactionMeterReadingRepository = new RentTransactionMeterReadingRepository(this.pool);
    }
    return this._transactionMeterReadingRepository;
  }

  // Service getters with lazy initialization
  public get propertyService(): IPropertyService {
    if (!this._propertyService) {
      this._propertyService = new PropertyService(this.propertyRepository, this.receiptTemplateService);
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
      this._unitService = new UnitService(this.unitRepository, this.rentPaymentService, this.meterService, this.meterReadingService, this.unitUtilityService);
    }
    return this._unitService;
  }

  public get unitTenantService(): IUnitTenantService {
    if (!this._unitTenantService) {
      this._unitTenantService = new UnitTenantService(this.unitTenantRepository);
    }
    return this._unitTenantService;
  }

  public get leaseService(): ILeaseService {
    if (!this._leaseService) {
      this._leaseService = new LeaseService(this.leaseRepository);
    }
    return this._leaseService;
  }

  public get rentPaymentService(): IRentPaymentService {
    if (!this._rentPaymentService) {
      this._rentPaymentService = new RentPaymentService(
        this.rentPaymentRepository,
        this.leaseRepository,
        this.propertyRepository,
        this.tenantRepository
      );
    }
    return this._rentPaymentService;
  }

  public get rentTransactionService(): IRentTransactionService {
    if (!this._rentTransactionService) {
      this._rentTransactionService = new RentTransactionService(
        this.rentTransactionRepository,
        this.leaseRepository,
        this.propertyRepository,
        this.tenantRepository,
        this.meterRepository,
        this.meterReadingRepository,
        this.receiptService,
        this.transactionMeterReadingRepository,
        this.userRepository,
        this.unitUtilityService
      );
    }
    return this._rentTransactionService;
  }

  public get meterService(): IMeterService {
    if (!this._meterService) {
      this._meterService = new MeterService(this.meterRepository);
    }
    return this._meterService;
  }

  public get meterReadingService(): IMeterReadingService {
    if (!this._meterReadingService) {
      this._meterReadingService = new MeterReadingService(this.meterReadingRepository);
    }
    return this._meterReadingService;
  }

  public get receiptService(): IReceiptService {
    if (!this._receiptService) {
      this._receiptService = new ReceiptService(
        this.receiptRepository,
        this.rentTransactionRepository,
        this.rentPaymentRepository,
        this.leaseRepository,
        this.propertyRepository,
        this.tenantRepository,
        this.userRepository,
        this.receiptTemplateService
      );
    }
    return this._receiptService;
  }

  public get receiptTemplateService(): ReceiptTemplateService {
    if (!this._receiptTemplateService) {
      this._receiptTemplateService = new ReceiptTemplateService(
        this.receiptTemplateRepository,
        this.propertyRepository as PropertyRepository
      );
    }
    return this._receiptTemplateService;
  }

  public get unitUtilityService(): IUnitUtilityService {
    if (!this._unitUtilityService) {
      this._unitUtilityService = new UnitUtilityService(this.unitUtilityRepository, this.meterService);
    }
    return this._unitUtilityService;
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

  public registerLeaseRepository(repository: ILeaseRepository): void {
    this._leaseRepository = repository;
  }

  public registerLeaseService(service: ILeaseService): void {
    this._leaseService = service;
  }

  public registerRentPaymentRepository(repository: IRentPaymentRepository): void {
    this._rentPaymentRepository = repository;
  }

  public registerRentPaymentService(service: IRentPaymentService): void {
    this._rentPaymentService = service;
  }

  public registerRentTransactionRepository(repository: IRentTransactionRepository): void {
    this._rentTransactionRepository = repository;
  }

  public registerRentTransactionService(service: IRentTransactionService): void {
    this._rentTransactionService = service;
  }

  public registerMeterRepository(repository: IMeterRepository): void {
    this._meterRepository = repository;
  }

  public registerMeterReadingRepository(repository: IMeterReadingRepository): void {
    this._meterReadingRepository = repository;
  }

  public registerMeterService(service: IMeterService): void {
    this._meterService = service;
  }

  public registerMeterReadingService(service: IMeterReadingService): void {
    this._meterReadingService = service;
  }

  public registerReceiptRepository(repository: IReceiptRepository): void {
    this._receiptRepository = repository;
  }

  public registerReceiptService(service: IReceiptService): void {
    this._receiptService = service;
  }

  public registerUnitUtilityRepository(repository: IUnitUtilityRepository): void {
    this._unitUtilityRepository = repository;
  }

  public registerUnitUtilityService(service: IUnitUtilityService): void {
    this._unitUtilityService = service;
  }

    // Reset method for testing
  public reset(): void {
    this._propertyRepository = null;
    this._userRepository = null;
    this._tenantRepository = null;
    this._unitRepository = null;
    this._unitTenantRepository = null;
    this._leaseRepository = null;
    this._rentPaymentRepository = null;
    this._rentTransactionRepository = null;
    this._meterRepository = null;
    this._meterReadingRepository = null;
    this._receiptRepository = null;
    this._transactionMeterReadingRepository = null;
    this._passwordResetMethodRepository = null;
    this._securityQuestionRepository = null;
    this._recoveryCodeRepository = null;
    this._receiptTemplateRepository = null;
    this._unitUtilityRepository = null;
    this._propertyService = null;
    this._userService = null;
    this._tenantService = null;
    this._unitService = null;
    this._unitTenantService = null;
    this._leaseService = null;
    this._rentPaymentService = null;
    this._rentTransactionService = null;
    this._meterService = null;
    this._meterReadingService = null;
    this._receiptService = null;
    this._passwordResetService = null;
    this._receiptTemplateService = null;
    this._unitUtilityService = null;
  }
}