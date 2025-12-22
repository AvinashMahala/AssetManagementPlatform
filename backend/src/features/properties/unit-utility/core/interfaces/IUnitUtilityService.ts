import { UnitUtility, UnitUtilityInput } from '@/models/Unit';

export interface IUnitUtilityService {
  // CRUD operations
  getAllUnitUtilities(): Promise<UnitUtility[]>;
  getUnitUtilityById(id: string): Promise<UnitUtility | null>;
  getUnitUtilitiesByUnit(unitId: string): Promise<UnitUtility[]>;
  getUnitUtilitiesByProperty(propertyId: string): Promise<UnitUtility[]>;
  createUnitUtility(utilityData: UnitUtilityInput): Promise<UnitUtility>;
  updateUnitUtility(id: string, utilityData: Partial<UnitUtilityInput>): Promise<UnitUtility | null>;
  deleteUnitUtility(id: string): Promise<boolean>;
  toggleUnitUtility(id: string, isEnabled: boolean): Promise<boolean>;

  // Business logic methods
  calculateUtilityCharges(unitId: string, startDate: Date, endDate: Date): Promise<any>;
  getUtilitySummary(unitId: string): Promise<any>;
  validateUtilityConfiguration(unitId: string): Promise<{ isValid: boolean; errors: string[] }>;
}