import { IAssetRepository } from '../interfaces/repositories/IAssetRepository.js';
import { Asset, AssetInput } from '../models/Asset.js';
import { ValidationUtils } from '../utils/validation.js';
import { ERROR_MESSAGES } from '../constants/validation.js';
import { IAssetService } from '../interfaces/services/IAssetService.js';

export class AssetService implements IAssetService {
  private repository: IAssetRepository;

  constructor(repository: IAssetRepository) {
    this.repository = repository;
  }

  async getAllAssets(): Promise<Asset[]> {
    return await this.repository.findAll();
  }

  async getAssetById(id: number): Promise<Asset | null> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.ASSET.INVALID_ID);
    }
    return await this.repository.findById(id);
  }

  async createAsset(assetData: AssetInput): Promise<Asset> {
    // Validate asset name
    const nameValidation = ValidationUtils.validateAssetName(assetData.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.message);
    }

    // Validate asset value if provided
    if (assetData.value !== undefined) {
      const valueValidation = ValidationUtils.validateAssetValue(assetData.value);
      if (!valueValidation.isValid) {
        throw new Error(valueValidation.message);
      }
    }

    return await this.repository.create(assetData);
  }

  async updateAsset(id: number, assetData: Partial<AssetInput>): Promise<Asset | null> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.ASSET.INVALID_ID);
    }

    // Validate asset name if being updated
    if (assetData.name !== undefined) {
      const nameValidation = ValidationUtils.validateAssetName(assetData.name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
      }
    }

    // Validate asset value if being updated
    if (assetData.value !== undefined) {
      const valueValidation = ValidationUtils.validateAssetValue(assetData.value);
      if (!valueValidation.isValid) {
        throw new Error(valueValidation.message);
      }
    }

    return await this.repository.update(id, assetData);
  }

  async deleteAsset(id: number): Promise<boolean> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.ASSET.INVALID_ID);
    }

    return await this.repository.delete(id);
  }
}