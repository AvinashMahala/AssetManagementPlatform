import { IUnitRepository } from '../interfaces/IUnitRepository.js';

export class GetUnitAnalyticsUseCase {
  constructor(private repository: IUnitRepository) {}

  async execute(unitId: string): Promise<any> {
    const unit = await this.repository.findById(unitId);
    if (!unit) {
      throw new Error('Unit not found');
    }

    // TODO: Implement full analytics
    // For now, return basic structure
    return {
      unit,
      financialSummary: {
        monthlyRent: unit.monthlyRent,
        securityDeposit: unit.securityDeposit,
        maintenanceCharges: unit.maintenanceCharges || 0,
        totalMonthlyCharges: unit.monthlyRent + (unit.maintenanceCharges || 0)
      },
      occupancyAnalytics: {
        currentStatus: unit.status,
        occupancyStatus: unit.status === 'occupied' ? 'occupied' : 'vacant',
        tenantCount: 0, // Need tenant repo
        maxOccupants: unit.maxOccupants || 1,
        hasActiveLease: false
      },
      paymentHistory: {
        totalPayments: 0,
        totalAmount: 0,
        onTimePayments: 0,
        latePayments: 0,
        averagePaymentTime: 0,
        recentPayments: [],
        paymentTrends: []
      },
      currentTenants: [], // Need tenant repo
      generatedAt: new Date()
    };
  }
}
