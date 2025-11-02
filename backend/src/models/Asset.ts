export interface Asset {
  id: number;
  name: string;
  description?: string;
  value?: number;
  location?: string;
}

export interface AssetInput {
  name: string;
  description?: string;
  value?: number;
  location?: string;
}