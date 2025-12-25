import { UnitUtility, UnitUtilityInput, UtilityType } from '@/features/properties/unit/core/types/unit.types';

export interface IUnitUtilityRepository {
  create(data: UnitUtilityInput): Promise<UnitUtility>;
  findAll(): Promise<UnitUtility[]>;
  findById(id: string): Promise<UnitUtility | null>;
  findByUnit(unitId: string): Promise<UnitUtility[]>;
  findByUnitAndType(unitId: string, utilityType: UtilityType): Promise<UnitUtility | null>;
  findByProperty(propertyId: string): Promise<UnitUtility[]>;
  findByMeter(meterId: string): Promise<UnitUtility[]>;
  update(id: string, data: Partial<UnitUtilityInput>): Promise<UnitUtility | null>;
  updateStatus(id: string, isEnabled: boolean): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  findEnabledByUnit(unitId: string): Promise<UnitUtility[]>;
}