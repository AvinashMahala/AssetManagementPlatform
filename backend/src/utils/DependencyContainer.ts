import { Pool } from 'pg';
import { IAssetRepository } from '../interfaces/repositories/IAssetRepository';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { IAssetService } from '../interfaces/services/IAssetService';
import { IUserService } from '../interfaces/services/IUserService';
import { AssetRepository } from '../repositories/AssetRepository';
import { UserRepository } from '../repositories/UserRepository';
import { PasswordResetMethodRepository } from '../repositories/PasswordResetMethodRepository';
import { SecurityQuestionRepository } from '../repositories/SecurityQuestionRepository';
import { RecoveryCodeRepository } from '../repositories/RecoveryCodeRepository';
import { AssetService } from '../services/AssetService';
import { UserService } from '../services/UserService';
import { PasswordResetService } from '../services/PasswordResetService';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private pool: Pool;

  // Repositories
  private _assetRepository: IAssetRepository | null = null;
  private _userRepository: IUserRepository | null = null;
  private _passwordResetMethodRepository: PasswordResetMethodRepository | null = null;
  private _securityQuestionRepository: SecurityQuestionRepository | null = null;
  private _recoveryCodeRepository: RecoveryCodeRepository | null = null;

  // Services
  private _assetService: IAssetService | null = null;
  private _userService: IUserService | null = null;
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
  public get assetRepository(): IAssetRepository {
    if (!this._assetRepository) {
      this._assetRepository = new AssetRepository(this.pool);
    }
    return this._assetRepository;
  }

  public get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(this.pool);
    }
    return this._userRepository;
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

  // Service getters with lazy initialization
  public get assetService(): IAssetService {
    if (!this._assetService) {
      this._assetService = new AssetService(this.assetRepository);
    }
    return this._assetService;
  }

  public get userService(): IUserService {
    if (!this._userService) {
      this._userService = new UserService(this.userRepository);
    }
    return this._userService;
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

  // Method to register custom implementations (for testing)
  public registerAssetRepository(repository: IAssetRepository): void {
    this._assetRepository = repository;
  }

  public registerUserRepository(repository: IUserRepository): void {
    this._userRepository = repository;
  }

  public registerAssetService(service: IAssetService): void {
    this._assetService = service;
  }

  public registerUserService(service: IUserService): void {
    this._userService = service;
  }

  // Reset method for testing
  public reset(): void {
    this._assetRepository = null;
    this._userRepository = null;
    this._passwordResetMethodRepository = null;
    this._securityQuestionRepository = null;
    this._recoveryCodeRepository = null;
    this._assetService = null;
    this._userService = null;
    this._passwordResetService = null;
  }
}