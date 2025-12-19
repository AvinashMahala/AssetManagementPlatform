import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUnitAnalytics } from '../../../hooks';
import { Card } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { RevenueTrendChart } from '@/componentDesignLibrary';
import { getErrorMessage } from '../../../types/api';
import { PageLoadingSpinner } from '../../../componentDesignLibrary';
import './UnitDashboardPage.module.scss';

export const UnitDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: analytics, loading, error } = useUnitAnalytics(id!);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <PageLoadingSpinner text="Loading unit analytics..." />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{getErrorMessage(error) || 'Analytics not available'}</p>
        </div>
      </div>
    );
  }

  const { unit, financialSummary, occupancyAnalytics, paymentHistory, utilityAnalytics, currentTenants } = analytics;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'under_maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unit {unit.unitNumber} Dashboard</h1>
          <p className="mt-2 text-gray-600">{unit.unitName || 'Unit Analytics & Insights'}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/units/${id}`)}
          >
            View Details
          </Button>
          <Button
            variant="default"
            onClick={() => navigate(`/units/${id}/edit`)}
          >
            Edit Unit
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Monthly Rent</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.monthlyRent)}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Security Deposit</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialSummary.securityDeposit)}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Occupancy Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(occupancyAnalytics.occupancyStatus)}`}>
            {occupancyAnalytics.occupancyStatus.toUpperCase()}
          </span>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Tenants</h3>
          <p className="text-2xl font-bold text-purple-600">{occupancyAnalytics.tenantCount}</p>
          <p className="text-sm text-gray-500">of {occupancyAnalytics.maxOccupants} max</p>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Rent:</span>
              <span className="font-medium">{formatCurrency(financialSummary.monthlyRent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Maintenance Charges:</span>
              <span className="font-medium">{formatCurrency(financialSummary.maintenanceCharges)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Total Monthly Charges:</span>
              <span className="font-bold text-lg">{formatCurrency(financialSummary.totalMonthlyCharges)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Occupancy Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Status:</span>
              <span className={`px-2 py-1 rounded text-sm ${getStatusColor(occupancyAnalytics.currentStatus)}`}>
                {occupancyAnalytics.currentStatus.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Tenants:</span>
              <span className="font-medium">{occupancyAnalytics.tenantCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Occupants:</span>
              <span className="font-medium">{occupancyAnalytics.maxOccupants}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Has Active Lease:</span>
              <span className={`font-medium ${occupancyAnalytics.hasActiveLease ? 'text-green-600' : 'text-red-600'}`}>
                {occupancyAnalytics.hasActiveLease ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Analytics</h2>
        
        {/* Payment Trends Chart */}
        {paymentHistory.paymentTrends && paymentHistory.paymentTrends.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Payment Trends (Last 12 Months)</h3>
            <RevenueTrendChart 
              data={paymentHistory.paymentTrends.map((trend: any) => ({
                month: trend.month,
                revenue: trend.totalAmount,
                target: financialSummary.monthlyRent * 30 // Rough estimate for chart
              }))} 
            />
          </div>
        )}

        {/* Payment Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{paymentHistory.totalPayments}</p>
            <p className="text-sm text-gray-600">Total Payments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(paymentHistory.totalAmount)}</p>
            <p className="text-sm text-gray-600">Total Amount</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{paymentHistory.onTimePayments}</p>
            <p className="text-sm text-gray-600">On-Time Payments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{paymentHistory.latePayments}</p>
            <p className="text-sm text-gray-600">Late Payments</p>
          </div>
        </div>

        {/* Payment Collection Rate */}
        {paymentHistory.totalPayments > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Payment Collection Rate</h3>
            <div className="bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(paymentHistory.onTimePayments / paymentHistory.totalPayments) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {Math.round((paymentHistory.onTimePayments / paymentHistory.totalPayments) * 100)}% on-time collection rate
            </p>
          </div>
        )}

        {/* Recent Payments */}
        {paymentHistory.recentPayments.length > 0 ? (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Recent Payments</h3>
            <div className="space-y-2">
              {paymentHistory.recentPayments.slice(0, 5).map((payment: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                    payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No payment history available</p>
        )}
      </Card>

      {/* Current Tenants */}
      {currentTenants && currentTenants.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Tenants</h2>
          <div className="space-y-3">
            {currentTenants.map((tenant: any) => (
              <div key={tenant.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium">{tenant.firstName} {tenant.lastName}</p>
                  <p className="text-sm text-gray-600">{tenant.email}</p>
                  <p className="text-sm text-gray-600">Rent Share: {formatCurrency(tenant.monthlyRentShare)}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                    tenant.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status}
                  </span>
                  {tenant.isPrimaryTenant && (
                    <p className="text-xs text-blue-600 mt-1">Primary Tenant</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Utility Consumption */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Utility Consumption</h2>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate(`/leases/create-tabbed?propertyId=${unit.propertyId}&unitId=${id}`)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create Lease
            </Button>
            <Button
              onClick={() => navigate(`/meters/create?propertyId=${unit.propertyId}&unitId=${id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Meter
            </Button>
          </div>
        </div>
        
        {utilityAnalytics.hasMeters ? (
          <>
            {/* Utility Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{utilityAnalytics.meters.length}</p>
                <p className="text-sm text-gray-600">Active Meters</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(utilityAnalytics.totalCosts.monthly)}</p>
                <p className="text-sm text-gray-600">Monthly Cost</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{utilityAnalytics.efficiency || 'N/A'}</p>
                <p className="text-sm text-gray-600">Efficiency Score</p>
              </div>
            </div>

            {/* Meter Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Meter Details</h3>
              {utilityAnalytics.meters.map((meter: any) => (
                <div key={meter.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{meter.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{meter.type}</p>
                    </div>
                    <span className="text-sm text-gray-500">{formatCurrency(meter.costPerUnit)}/unit</span>
                  </div>
                  
                  {/* Consumption Trend for this meter */}
                  {utilityAnalytics.consumptionTrends.find((trend: any) => trend.meterId === meter.id) && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-1">Recent Consumption:</p>
                      <div className="flex space-x-2 text-xs">
                        {utilityAnalytics.consumptionTrends
                          .find((trend: any) => trend.meterId === meter.id)
                          .monthlyConsumption.slice(-3)
                          .map((month: any, index: number) => (
                            <div key={index} className="text-center">
                              <p className="font-medium">{month.consumption}</p>
                              <p className="text-gray-500">{month.month}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600">No utility meters configured for this unit</p>
            <p className="text-sm text-gray-500 mt-1">Add meters to track electricity, water, and gas consumption</p>
          </div>
        )}
      </Card>
    </div>
  );
};