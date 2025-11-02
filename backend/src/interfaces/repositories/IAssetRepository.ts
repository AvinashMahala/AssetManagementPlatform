import { Asset, AssetInput } from '../../models/Asset';

export interface IAssetRepository {
  findAll(): Promise<Asset[]>;
  findById(id: number): Promise<Asset | null>;
  create(data: Omit<Asset, 'id'>): Promise<Asset>;
  update(id: number, data: Partial<Omit<Asset, 'id'>>): Promise<Asset | null>;
  delete(id: number): Promise<boolean>;
}