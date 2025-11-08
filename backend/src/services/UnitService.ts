import { IUnitRepository } from '../interfaces/repositories/IUnitRepository.js';
import { Unit, UnitInput, UnitTenant, UnitTenantInput, UnitStatus } from '../models/Unit.js';
import { ValidationUtils } from '../utils/validation.js';
import { ERROR_MESSAGES } from '../constants/validation.js';
import { IUnitService } from '../interfaces/services/IUnitService.js';
import { IRentPaymentService } from '../interfaces/services/IRentPaymentService.js';
import { IMeterService } from '../interfaces/services/IMeterService.js';
import { IMeterReadingService } from '../interfaces/services/IMeterService.js';

export class UnitService implements IUnitService {
  private repository: IUnitRepository;
  private rentPaymentService: IRentPaymentService;
  private meterService: IMeterService;
  private meterReadingService: IMeterReadingService;

  constructor(repository: IUnitRepository, rentPaymentService: IRentPaymentService, meterService: IMeterService, meterReadingService: IMeterReadingService) {
    this.repository = repository;
    this.rentPaymentService = rentPaymentService;
    this.meterService = meterService;
    this.meterReadingService = meterReadingService;
  }

  async getAllUnits(): Promise<Unit[]> {
    return await this.repository.findAll();
  }

  async getUnitById(id: string): Promise<Unit | null> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT.INVALID_ID);
    }
    return await this.repository.findById(id);
  }

  async getUnitsByProperty(propertyId: string): Promise<Unit[]> {
    const propertyValidation = ValidationUtils.validateUnitPropertyId(propertyId);
    if (!propertyValidation.isValid) {
      throw new Error(propertyValidation.message);
    }
    return await this.repository.findByProperty(propertyId);
  }

  async getUnitsByStatus(status: string): Promise<Unit[]> {
    const statusValidation = ValidationUtils.validateUnitStatus(status);
    if (!statusValidation.isValid) {
      throw new Error(statusValidation.message);
    }
    return await this.repository.findByStatus(status);
  }

  async createUnit(unitData: UnitInput): Promise<Unit> {
    // Validate property ID
    const propertyValidation = ValidationUtils.validateUnitPropertyId(unitData.propertyId);
    if (!propertyValidation.isValid) {
      throw new Error(propertyValidation.message);
    }

    // Validate unit number
    const unitNumberValidation = ValidationUtils.validateUnitNumber(unitData.unitNumber);
    if (!unitNumberValidation.isValid) {
      throw new Error(unitNumberValidation.message);
    }

    // Validate unit name
    if (unitData.unitName !== undefined) {
      const unitNameValidation = ValidationUtils.validateUnitName(unitData.unitName);
      if (!unitNameValidation.isValid) {
        throw new Error(unitNameValidation.message);
      }
    }

    // Validate description
    if (unitData.description !== undefined) {
      const descriptionValidation = ValidationUtils.validateUnitDescription(unitData.description);
      if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
      }
    }

    // Validate unit type
    const unitTypeValidation = ValidationUtils.validateUnitType(unitData.unitType);
    if (!unitTypeValidation.isValid) {
      throw new Error(unitTypeValidation.message);
    }

    // Validate status
    if (unitData.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitStatus(unitData.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    // Validate area
    const areaValidation = ValidationUtils.validateUnitArea(unitData.area);
    if (!areaValidation.isValid) {
      throw new Error(areaValidation.message);
    }

    // Validate floor
    if (unitData.floor !== undefined) {
      const floorValidation = ValidationUtils.validateUnitFloor(unitData.floor);
      if (!floorValidation.isValid) {
        throw new Error(floorValidation.message);
      }
    }

    // Validate bedrooms
    if (unitData.bedrooms !== undefined) {
      const bedroomsValidation = ValidationUtils.validateUnitBedrooms(unitData.bedrooms);
      if (!bedroomsValidation.isValid) {
        throw new Error(bedroomsValidation.message);
      }
    }

    // Validate bathrooms
    if (unitData.bathrooms !== undefined) {
      const bathroomsValidation = ValidationUtils.validateUnitBathrooms(unitData.bathrooms);
      if (!bathroomsValidation.isValid) {
        throw new Error(bathroomsValidation.message);
      }
    }

    // Validate balconies
    if (unitData.balconies !== undefined) {
      const balconiesValidation = ValidationUtils.validateUnitBalconies(unitData.balconies);
      if (!balconiesValidation.isValid) {
        throw new Error(balconiesValidation.message);
      }
    }

    // Validate max occupants
    if (unitData.maxOccupants !== undefined) {
      const maxOccupantsValidation = ValidationUtils.validateUnitMaxOccupants(unitData.maxOccupants);
      if (!maxOccupantsValidation.isValid) {
        throw new Error(maxOccupantsValidation.message);
      }
    }

    // Validate monthly rent
    const rentValidation = ValidationUtils.validateUnitMonthlyRent(unitData.monthlyRent);
    if (!rentValidation.isValid) {
      throw new Error(rentValidation.message);
    }

    // Validate security deposit
    const depositValidation = ValidationUtils.validateUnitSecurityDeposit(unitData.securityDeposit);
    if (!depositValidation.isValid) {
      throw new Error(depositValidation.message);
    }

    // Validate maintenance charges
    if (unitData.maintenanceCharges !== undefined) {
      const maintenanceValidation = ValidationUtils.validateUnitMaintenanceCharges(unitData.maintenanceCharges);
      if (!maintenanceValidation.isValid) {
        throw new Error(maintenanceValidation.message);
      }
    }

    // Validate unit amenities
    if (unitData.unitAmenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateUnitAmenities(unitData.unitAmenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    // Validate unit photos
    if (unitData.unitPhotos !== undefined) {
      const photosValidation = ValidationUtils.validateUnitPhotos(unitData.unitPhotos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    // Ensure optional fields have proper defaults
    const unitDataWithDefaults: UnitInput = {
      propertyId: unitData.propertyId,
      unitNumber: unitData.unitNumber,
      unitName: unitData.unitName,
      description: unitData.description,
      unitType: unitData.unitType,
      status: unitData.status || UnitStatus.AVAILABLE,
      floor: unitData.floor,
      area: unitData.area,
      bedrooms: unitData.bedrooms,
      bathrooms: unitData.bathrooms,
      balconies: unitData.balconies,
      furnished: unitData.furnished || false,
      maxOccupants: unitData.maxOccupants,
      unitAmenities: unitData.unitAmenities || [],
      unitPhotos: unitData.unitPhotos || [],
      monthlyRent: unitData.monthlyRent,
      securityDeposit: unitData.securityDeposit,
      maintenanceCharges: unitData.maintenanceCharges,
    };

    return await this.repository.create(unitDataWithDefaults);
  }

  async updateUnit(id: string, unitData: Partial<UnitInput>): Promise<Unit | null> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT.INVALID_ID);
    }

    // Validate fields if they are being updated
    if (unitData.unitNumber !== undefined) {
      const unitNumberValidation = ValidationUtils.validateUnitNumber(unitData.unitNumber);
      if (!unitNumberValidation.isValid) {
        throw new Error(unitNumberValidation.message);
      }
    }

    if (unitData.unitName !== undefined) {
      const unitNameValidation = ValidationUtils.validateUnitName(unitData.unitName);
      if (!unitNameValidation.isValid) {
        throw new Error(unitNameValidation.message);
      }
    }

    if (unitData.description !== undefined) {
      const descriptionValidation = ValidationUtils.validateUnitDescription(unitData.description);
      if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
      }
    }

    if (unitData.unitType !== undefined) {
      const unitTypeValidation = ValidationUtils.validateUnitType(unitData.unitType);
      if (!unitTypeValidation.isValid) {
        throw new Error(unitTypeValidation.message);
      }
    }

    if (unitData.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitStatus(unitData.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    if (unitData.area !== undefined) {
      const areaValidation = ValidationUtils.validateUnitArea(unitData.area);
      if (!areaValidation.isValid) {
        throw new Error(areaValidation.message);
      }
    }

    if (unitData.floor !== undefined) {
      const floorValidation = ValidationUtils.validateUnitFloor(unitData.floor);
      if (!floorValidation.isValid) {
        throw new Error(floorValidation.message);
      }
    }

    if (unitData.bedrooms !== undefined) {
      const bedroomsValidation = ValidationUtils.validateUnitBedrooms(unitData.bedrooms);
      if (!bedroomsValidation.isValid) {
        throw new Error(bedroomsValidation.message);
      }
    }

    if (unitData.bathrooms !== undefined) {
      const bathroomsValidation = ValidationUtils.validateUnitBathrooms(unitData.bathrooms);
      if (!bathroomsValidation.isValid) {
        throw new Error(bathroomsValidation.message);
      }
    }

    if (unitData.balconies !== undefined) {
      const balconiesValidation = ValidationUtils.validateUnitBalconies(unitData.balconies);
      if (!balconiesValidation.isValid) {
        throw new Error(balconiesValidation.message);
      }
    }

    if (unitData.maxOccupants !== undefined) {
      const maxOccupantsValidation = ValidationUtils.validateUnitMaxOccupants(unitData.maxOccupants);
      if (!maxOccupantsValidation.isValid) {
        throw new Error(maxOccupantsValidation.message);
      }
    }

    if (unitData.monthlyRent !== undefined) {
      const rentValidation = ValidationUtils.validateUnitMonthlyRent(unitData.monthlyRent);
      if (!rentValidation.isValid) {
        throw new Error(rentValidation.message);
      }
    }

    if (unitData.securityDeposit !== undefined) {
      const depositValidation = ValidationUtils.validateUnitSecurityDeposit(unitData.securityDeposit);
      if (!depositValidation.isValid) {
        throw new Error(depositValidation.message);
      }
    }

    if (unitData.maintenanceCharges !== undefined) {
      const maintenanceValidation = ValidationUtils.validateUnitMaintenanceCharges(unitData.maintenanceCharges);
      if (!maintenanceValidation.isValid) {
        throw new Error(maintenanceValidation.message);
      }
    }

    if (unitData.unitAmenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateUnitAmenities(unitData.unitAmenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    if (unitData.unitPhotos !== undefined) {
      const photosValidation = ValidationUtils.validateUnitPhotos(unitData.unitPhotos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    return await this.repository.update(id, unitData);
  }

  async deleteUnit(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT.INVALID_ID);
    }

    return await this.repository.delete(id);
  }

  async updateUnitStatus(id: string, status: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT.INVALID_ID);
    }

    const statusValidation = ValidationUtils.validateUnitStatus(status);
    if (!statusValidation.isValid) {
      throw new Error(statusValidation.message);
    }

    return await this.repository.updateStatus(id, status);
  }

  async getUnitTenants(unitId: string): Promise<UnitTenant[]> {
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    return await this.repository.findUnitTenants(unitId);
  }

  async assignTenantToUnit(unitTenantData: UnitTenantInput): Promise<UnitTenant> {
    // Validate unit ID
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitTenantData.unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    // Validate tenant ID
    const tenantValidation = ValidationUtils.validateUnitTenantTenantId(unitTenantData.tenantId);
    if (!tenantValidation.isValid) {
      throw new Error(tenantValidation.message);
    }

    // Validate rent share
    const rentShareValidation = ValidationUtils.validateUnitTenantRentShare(unitTenantData.monthlyRentShare);
    if (!rentShareValidation.isValid) {
      throw new Error(rentShareValidation.message);
    }

    // Validate security deposit share
    const depositShareValidation = ValidationUtils.validateUnitTenantSecurityDepositShare(unitTenantData.securityDepositShare);
    if (!depositShareValidation.isValid) {
      throw new Error(depositShareValidation.message);
    }

    // Validate status
    if (unitTenantData.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitTenantStatus(unitTenantData.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    return await this.repository.assignTenantToUnit(unitTenantData);
  }

  async removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean> {
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    const tenantValidation = ValidationUtils.validateUnitTenantTenantId(tenantId);
    if (!tenantValidation.isValid) {
      throw new Error(tenantValidation.message);
    }

    return await this.repository.removeTenantFromUnit(unitId, tenantId);
  }

  async updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null> {
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    const tenantValidation = ValidationUtils.validateUnitTenantTenantId(tenantId);
    if (!tenantValidation.isValid) {
      throw new Error(tenantValidation.message);
    }

    // Validate fields if they are being updated
    if (updates.monthlyRentShare !== undefined) {
      const rentShareValidation = ValidationUtils.validateUnitTenantRentShare(updates.monthlyRentShare);
      if (!rentShareValidation.isValid) {
        throw new Error(rentShareValidation.message);
      }
    }

    if (updates.securityDepositShare !== undefined) {
      const depositShareValidation = ValidationUtils.validateUnitTenantSecurityDepositShare(updates.securityDepositShare);
      if (!depositShareValidation.isValid) {
        throw new Error(depositShareValidation.message);
      }
    }

    if (updates.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitTenantStatus(updates.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    return await this.repository.updateTenantAssignment(unitId, tenantId, updates);
  }

  // ===== ANALYTICS METHODS =====

  /**
   * Get comprehensive analytics for a specific unit
   */
  async getUnitAnalytics(unitId: string): Promise<any> {
    if (!unitId || unitId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT.INVALID_ID);
    }

    const unit = await this.repository.findById(unitId);
    if (!unit) {
      throw new Error('Unit not found');
    }

    // Get financial summary
    const financialSummary = await this.getUnitFinancialSummary(unitId);

    // Get occupancy analytics
    const occupancyAnalytics = await this.getUnitOccupancyAnalytics(unitId);

    // Get payment history (last 12 months)
    const paymentHistory = await this.getUnitPaymentHistory(unitId, 12);

    // Get utility consumption analytics
    const utilityAnalytics = await this.getUnitUtilityAnalytics(unitId);

    // Get current tenants
    const currentTenants = await this.repository.findUnitTenants(unitId);

    return {
      unit: unit,
      financialSummary,
      occupancyAnalytics,
      paymentHistory,
      utilityAnalytics,
      currentTenants,
      generatedAt: new Date()
    };
  }

  /**
   * Get financial summary for a unit
   */
  async getUnitFinancialSummary(unitId: string): Promise<any> {
    // This would typically involve querying rent_payments and leases tables
    // For now, return basic unit financial info
    const unit = await this.repository.findById(unitId);
    if (!unit) {
      throw new Error('Unit not found');
    }

    return {
      monthlyRent: unit.monthlyRent,
      securityDeposit: unit.securityDeposit,
      maintenanceCharges: unit.maintenanceCharges || 0,
      totalMonthlyCharges: unit.monthlyRent + (unit.maintenanceCharges || 0)
    };
  }

  /**
   * Get occupancy analytics for a unit
   */
  async getUnitOccupancyAnalytics(unitId: string): Promise<any> {
    const unit = await this.repository.findById(unitId);
    if (!unit) {
      throw new Error('Unit not found');
    }

    const currentTenants = await this.repository.findUnitTenants(unitId);
    const hasActiveTenants = currentTenants.some((tenant: UnitTenant) => tenant.status === 'active');

    // Calculate occupancy rate (simplified - in real implementation would check lease dates)
    const occupancyStatus = hasActiveTenants ? 'occupied' : 'vacant';

    return {
      currentStatus: unit.status,
      occupancyStatus,
      tenantCount: currentTenants.filter((t: UnitTenant) => t.status === 'active').length,
      maxOccupants: unit.maxOccupants || 1,
      hasActiveLease: hasActiveTenants
    };
  }

  /**
   * Get payment history for a unit
   */
  async getUnitPaymentHistory(unitId: string, months: number = 12): Promise<any> {
    try {
      // Get current tenants for this unit
      const currentTenants = await this.repository.findUnitTenants(unitId);
      const tenantIds = currentTenants
        .filter((tenant: UnitTenant) => tenant.status === 'active')
        .map((tenant: UnitTenant) => tenant.tenantId);

      if (tenantIds.length === 0) {
        return {
          totalPayments: 0,
          totalAmount: 0,
          onTimePayments: 0,
          latePayments: 0,
          averagePaymentTime: 0,
          recentPayments: [],
          paymentTrends: []
        };
      }

      // Get payments for all tenants in this unit
      const allPayments = [];
      for (const tenantId of tenantIds) {
        const tenantPayments = await this.rentPaymentService.getPaymentsByTenant(tenantId);
        allPayments.push(...tenantPayments);
      }

      // Filter payments from the last N months
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      const recentPayments = allPayments.filter(payment => {
        const paymentDate = payment.paidDate || payment.dueDate;
        return paymentDate >= cutoffDate;
      });

      // Calculate payment statistics
      const paidPayments = recentPayments.filter(p => p.status === 'paid');
      const overduePayments = recentPayments.filter(p => p.status === 'overdue');

      const totalAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0);
      const onTimePayments = paidPayments.filter(p => {
        if (!p.paidDate) return false;
        return p.paidDate <= p.dueDate;
      }).length;

      // Calculate payment trends (monthly data)
      const paymentTrends = this.calculatePaymentTrends(recentPayments);

      // Get recent payments (last 5)
      const recentPaymentsList = paidPayments
        .sort((a, b) => {
          const dateA = a.paidDate || a.dueDate;
          const dateB = b.paidDate || b.dueDate;
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5)
        .map(payment => ({
          id: payment.id,
          amount: payment.amount,
          date: payment.paidDate || payment.dueDate,
          status: payment.status,
          tenantId: payment.tenantId
        }));

      return {
        totalPayments: paidPayments.length,
        totalAmount,
        onTimePayments,
        latePayments: overduePayments.length,
        averagePaymentTime: this.calculateAveragePaymentTime(paidPayments),
        recentPayments: recentPaymentsList,
        paymentTrends
      };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Return empty data structure on error
      return {
        totalPayments: 0,
        totalAmount: 0,
        onTimePayments: 0,
        latePayments: 0,
        averagePaymentTime: 0,
        recentPayments: [],
        paymentTrends: []
      };
    }
  }

  /**
   * Calculate payment trends by month
   */
  private calculatePaymentTrends(payments: any[]): any[] {
    const monthlyData: { [key: string]: { total: number, count: number, onTime: number } } = {};

    payments.forEach(payment => {
      if (payment.status === 'paid') {
        const date = payment.paidDate || payment.dueDate;
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, count: 0, onTime: 0 };
        }

        monthlyData[monthKey].total += payment.amount;
        monthlyData[monthKey].count += 1;

        if (payment.paidDate && payment.paidDate <= payment.dueDate) {
          monthlyData[monthKey].onTime += 1;
        }
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        totalAmount: data.total,
        paymentCount: data.count,
        onTimePercentage: data.count > 0 ? (data.onTime / data.count) * 100 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate average payment time in days
   */
  private calculateAveragePaymentTime(payments: any[]): number {
    const paidOnTime = payments.filter(p => p.paidDate && p.paidDate <= p.dueDate);

    if (paidOnTime.length === 0) return 0;

    const totalDays = paidOnTime.reduce((sum, p) => {
      const diffTime = p.paidDate.getTime() - p.dueDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return sum + diffDays;
    }, 0);

    return Math.round(totalDays / paidOnTime.length);
  }

  /**
   * Get utility consumption analytics for a unit
   */
  async getUnitUtilityAnalytics(unitId: string): Promise<any> {
    try {
      // Get all meters for this unit
      const meters = await this.meterService.getActiveMetersByUnit(unitId);

      if (meters.length === 0) {
        return {
          hasMeters: false,
          meters: [],
          consumptionTrends: [],
          totalCosts: { monthly: 0, yearly: 0 },
          efficiency: null
        };
      }

      // Get consumption data for each meter (last 12 months)
      const consumptionTrends = [];
      let totalMonthlyCost = 0;
      let totalYearlyCost = 0;

      for (const meter of meters) {
        const readings = await this.meterReadingService.getMeterReadingsByMeter(meter.id);

        // Calculate monthly consumption and costs
        const monthlyData = this.calculateMonthlyConsumption(readings, meter);
        consumptionTrends.push({
          meterId: meter.id,
          meterName: meter.meterName,
          meterType: meter.meterType,
          monthlyConsumption: monthlyData
        });

        // Calculate total costs
        const meterCosts = monthlyData.reduce((sum, month) => sum + month.totalCost, 0);
        totalMonthlyCost += meterCosts / 12; // Average monthly
        totalYearlyCost += meterCosts;
      }

      return {
        hasMeters: true,
        meters: meters.map(m => ({
          id: m.id,
          name: m.meterName,
          type: m.meterType,
          costPerUnit: m.costPerUnit
        })),
        consumptionTrends,
        totalCosts: {
          monthly: Math.round(totalMonthlyCost * 100) / 100,
          yearly: Math.round(totalYearlyCost * 100) / 100
        },
        efficiency: this.calculateEfficiencyScore(consumptionTrends)
      };
    } catch (error) {
      console.error('Error fetching utility analytics:', error);
      return {
        hasMeters: false,
        meters: [],
        consumptionTrends: [],
        totalCosts: { monthly: 0, yearly: 0 },
        efficiency: null
      };
    }
  }

  /**
   * Calculate monthly consumption data from meter readings
   */
  private calculateMonthlyConsumption(readings: any[], meter: any): any[] {
    const monthlyData: { [key: string]: { consumption: number, cost: number, readings: number } } = {};

    // Sort readings by date
    readings.sort((a, b) => a.readingDate.getTime() - b.readingDate.getTime());

    for (let i = 1; i < readings.length; i++) {
      const current = readings[i];
      const previous = readings[i - 1];

      const monthKey = `${current.readingDate.getFullYear()}-${String(current.readingDate.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { consumption: 0, cost: 0, readings: 0 };
      }

      monthlyData[monthKey].consumption += current.unitsConsumed;
      monthlyData[monthKey].cost += current.totalCost;
      monthlyData[monthKey].readings += 1;
    }

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        consumption: Math.round(data.consumption * 100) / 100,
        totalCost: Math.round(data.cost * 100) / 100,
        averageCost: data.readings > 0 ? Math.round((data.cost / data.readings) * 100) / 100 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }

  /**
   * Calculate efficiency score based on consumption patterns
   */
  private calculateEfficiencyScore(consumptionTrends: any[]): any {
    if (consumptionTrends.length === 0) return null;

    // Simple efficiency calculation based on consistency and cost trends
    let totalScore = 0;
    let meterCount = 0;

    for (const trend of consumptionTrends) {
      if (trend.monthlyConsumption.length >= 3) {
        const recent = trend.monthlyConsumption.slice(-3);
        const avgConsumption = recent.reduce((sum: number, m: any) => sum + m.consumption, 0) / recent.length;
        const variance = recent.reduce((sum: number, m: any) => sum + Math.pow(m.consumption - avgConsumption, 2), 0) / recent.length;
        const consistencyScore = Math.max(0, 100 - (variance / avgConsumption) * 100);

        totalScore += consistencyScore;
        meterCount++;
      }
    }

    return meterCount > 0 ? Math.round(totalScore / meterCount) : null;
  }
}