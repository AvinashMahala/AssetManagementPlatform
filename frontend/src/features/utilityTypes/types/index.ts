export interface UtilityType {
  id: string;
  key: string;
  name: string;
  unitOfMeasure?: string;
  metadata?: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface UtilityTypeInput {
  key: string;
  name: string;
  unitOfMeasure?: string;
  metadata?: string;
}

export interface UtilityTypeFilters {
  search?: string;
}
