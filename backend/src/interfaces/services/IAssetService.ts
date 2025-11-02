import { Asset, AssetInput } from '../../models/Asset';

export interface IAssetService {
  getAllAssets(): Promise<Asset[]>;
  getAssetById(id: number): Promise<Asset | null>;
  createAsset(assetData: AssetInput): Promise<Asset>;
  updateAsset(id: number, assetData: Partial<AssetInput>): Promise<Asset | null>;
  deleteAsset(id: number): Promise<boolean>;
}