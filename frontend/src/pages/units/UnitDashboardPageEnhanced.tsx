import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUnitAnalytics } from '../../hooks';
import { Card } from '../../components/common';
import { Button } from '../../components/common/Button';
import { RevenueTrendChart } from '../../components/ui/charts';
import { getErrorMessage } from '../../types/api';
import './UnitDashboardPageEnhanced.scss';

export const UnitDashboardPageEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: analytics, loading, error } = useUnitAnalytics(id!);

  // Animation and interaction states
  const [revealedSections, setRevealedSections] = useState<Set<string>>(new Set());

  // Refs for scroll-triggered animations
  const headerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const tenantsRef = useRef<HTMLDivElement>(null);
  const utilityRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section');
          if (sectionId) {
            setRevealedSections(prev => new Set([...prev, sectionId]));
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = [headerRef, metricsRef, contentRef, analyticsRef, tenantsRef, utilityRef];
    sections.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="unit-dashboard-enhanced">
        <div className="loading-state">
          <div className="loading-text">Loading unit analytics...</div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="unit-dashboard-enhanced">
        <div className="error-state">
          <div className="error-message">
            <p className="error-text">{getErrorMessage(error) || 'Analytics not available'}</p>
          </div>
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
      case 'available': return 'available';
      case 'occupied': return 'occupied';
      case 'under_maintenance': return 'maintenance';
      case 'reserved': return 'reserved';
      default: return '';
    }
  };

  return (
    <div className="unit-dashboard-enhanced">
      {/* Enhanced Header */}
      <div
        ref={headerRef}
        data-section="header"
        className={`dashboard-header ${revealedSections.has('header') ? 'revealed' : ''}`}
      >
        <div>
          <h1 className="header-title">Unit {unit.unitNumber} Dashboard</h1>
          <p className="header-subtitle">{unit.unitName || 'Unit Analytics & Insights'}</p>
        </div>
        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={() => navigate(`/units/${id}`)}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/units/${id}/edit`)}
          >
            Edit Unit
          </Button>
        </div>
      </div>

      {/* Enhanced Key Metrics Row */}
      <div
        ref={metricsRef}
        data-section="metrics"
        className="metrics-grid"
      >
        <Card className={`metric-card ${revealedSections.has('metrics') ? 'revealed' : ''}`}>
          <h3 className="metric-title">Monthly Rent</h3>
          <p className="metric-value rent">{formatCurrency(financialSummary.monthlyRent)}</p>
        </Card>

        <Card className={`metric-card ${revealedSections.has('metrics') ? 'revealed' : ''}`}>
          <h3 className="metric-title">Security Deposit</h3>
          <p className="metric-value deposit">{formatCurrency(financialSummary.securityDeposit)}</p>
        </Card>

        <Card className={`metric-card ${revealedSections.has('metrics') ? 'revealed' : ''}`}>
          <h3 className="metric-title">Occupancy Status</h3>
          <span className={`status-badge ${getStatusColor(occupancyAnalytics.occupancyStatus)}`}>
            {occupancyAnalytics.occupancyStatus.toUpperCase()}
          </span>
        </Card>

        <Card className={`metric-card ${revealedSections.has('metrics') ? 'revealed' : ''}`}>
          <h3 className="metric-title">Active Tenants</h3>
          <p className="metric-value tenants">{occupancyAnalytics.tenantCount}</p>
          <p className="metric-subtitle">of {occupancyAnalytics.maxOccupants} max</p>
        </Card>
      </div>

      {/* Enhanced Financial Overview and Occupancy Details */}
      <div
        ref={contentRef}
        data-section="content"
        className="content-grid"
      >
        <Card className={`content-card ${revealedSections.has('content') ? 'revealed' : ''}`}>
          <h2 className="card-title">Financial Overview</h2>
          <div className="info-row">
            <span className="label">Monthly Rent:</span>
            <span className="value">{formatCurrency(financialSummary.monthlyRent)}</span>
          </div>
          <div className="info-row">
            <span className="label">Maintenance Charges:</span>
            <span className="value">{formatCurrency(financialSummary.maintenanceCharges)}</span>
          </div>
          <div className="info-row">
            <span className="label">Total Monthly Charges:</span>
            <span className="value highlight">{formatCurrency(financialSummary.totalMonthlyCharges)}</span>
          </div>
        </Card>

        <Card className={`content-card ${revealedSections.has('content') ? 'revealed' : ''}`}>
          <h2 className="card-title">Occupancy Details</h2>
          <div className="info-row">
            <span className="label">Current Status:</span>
            <span className={`value status ${getStatusColor(occupancyAnalytics.currentStatus)}`}>
              {occupancyAnalytics.currentStatus.replace('_', ' ')}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Active Tenants:</span>
            <span className="value">{occupancyAnalytics.tenantCount}</span>
          </div>
          <div className="info-row">
            <span className="label">Max Occupants:</span>
            <span className="value">{occupancyAnalytics.maxOccupants}</span>
          </div>
          <div className="info-row">
            <span className="label">Has Active Lease:</span>
            <span className={`value boolean ${occupancyAnalytics.hasActiveLease ? 'true' : 'false'}`}>
              {occupancyAnalytics.hasActiveLease ? 'Yes' : 'No'}
            </span>
          </div>
        </Card>
      </div>

      {/* Enhanced Payment History */}
      <div
        ref={analyticsRef}
        data-section="analytics"
      >
        <Card className={`analytics-card ${revealedSections.has('analytics') ? 'revealed' : ''}`}>
        <h2 className="card-title">Payment Analytics</h2>

        {/* Payment Trends Chart */}
        {paymentHistory.paymentTrends && paymentHistory.paymentTrends.length > 0 && (
          <div className="chart-section">
            <h3 className="section-title">Payment Trends (Last 12 Months)</h3>
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
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-value primary">{paymentHistory.totalPayments}</p>
            <p className="stat-label">Total Payments</p>
          </div>
          <div className="stat-item">
            <p className="stat-value success">{formatCurrency(paymentHistory.totalAmount)}</p>
            <p className="stat-label">Total Amount</p>
          </div>
          <div className="stat-item">
            <p className="stat-value success">{paymentHistory.onTimePayments}</p>
            <p className="stat-label">On-Time Payments</p>
          </div>
          <div className="stat-item">
            <p className="stat-value danger">{paymentHistory.latePayments}</p>
            <p className="stat-label">Late Payments</p>
          </div>
        </div>

        {/* Payment Collection Rate */}
        {paymentHistory.totalPayments > 0 && (
          <div className="progress-section">
            <h3 className="section-title">Payment Collection Rate</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(paymentHistory.onTimePayments / paymentHistory.totalPayments) * 100}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {Math.round((paymentHistory.onTimePayments / paymentHistory.totalPayments) * 100)}% on-time collection rate
            </p>
          </div>
        )}

        {/* Recent Payments */}
        {paymentHistory.recentPayments.length > 0 ? (
          <div className="payments-list">
            <h3 className="section-title">Recent Payments</h3>
            <div className="space-y-2">
              {paymentHistory.recentPayments.slice(0, 5).map((payment: any, index: number) => (
                <div key={index} className="payment-item">
                  <div className="payment-info">
                    <p className="amount">{formatCurrency(payment.amount)}</p>
                    <p className="date">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`payment-status ${payment.status}`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="payments-list">
            <p className="no-payments">No payment history available</p>
          </div>
        )}
      </Card>
      </div>

      {/* Enhanced Current Tenants */}
      {currentTenants && currentTenants.length > 0 && (
        <div
          ref={tenantsRef}
          data-section="tenants"
        >
          <Card className={`tenants-card ${revealedSections.has('tenants') ? 'revealed' : ''}`}>
          <h2 className="card-title">Current Tenants</h2>
          <div className="space-y-3">
            {currentTenants.map((tenant: any) => (
              <div key={tenant.id} className="tenant-item">
                <div className="tenant-info">
                  <p className="name">{tenant.firstName} {tenant.lastName}</p>
                  <p className="email">{tenant.email}</p>
                  <p className="rent-share">Rent Share: {formatCurrency(tenant.monthlyRentShare)}</p>
                </div>
                <div className="tenant-status">
                  <span className={`status-badge ${tenant.status}`}>
                    {tenant.status}
                  </span>
                  {tenant.isPrimaryTenant && (
                    <p className="primary-indicator">Primary Tenant</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
        </div>
      )}

      {/* Enhanced Utility Consumption */}
      <div
        ref={utilityRef}
        data-section="utility"
      >
        <Card className={`utility-card ${revealedSections.has('utility') ? 'revealed' : ''}`}>
        <div className="card-header">
          <h2 className="card-title">Utility Consumption</h2>
          <div className="card-actions">
            <Button
              onClick={() => navigate(`/leases/create-tabbed?propertyId=${unit.propertyId}&unitId=${id}`)}
              className="btn-create-lease"
            >
              Create Lease
            </Button>
            <Button
              onClick={() => navigate(`/meters/create?propertyId=${unit.propertyId}&unitId=${id}`)}
              className="btn-add-meter"
            >
              Add Meter
            </Button>
          </div>
        </div>

        {utilityAnalytics.hasMeters ? (
          <>
            {/* Utility Overview */}
            <div className="utility-overview">
              <div className="overview-item">
                <p className="item-value meters">{utilityAnalytics.meters.length}</p>
                <p className="item-label">Active Meters</p>
              </div>
              <div className="overview-item">
                <p className="item-value cost">{formatCurrency(utilityAnalytics.totalCosts.monthly)}</p>
                <p className="item-label">Monthly Cost</p>
              </div>
              <div className="overview-item">
                <p className="item-value efficiency">{utilityAnalytics.efficiency || 'N/A'}</p>
                <p className="item-label">Efficiency Score</p>
              </div>
            </div>

            {/* Meter Details */}
            <div className="meter-details">
              <h3 className="section-title">Meter Details</h3>
              {utilityAnalytics.meters.map((meter: any) => (
                <div key={meter.id} className="meter-item">
                  <div className="meter-header">
                    <div className="meter-info">
                      <h4 className="meter-name">{meter.name}</h4>
                      <p className="meter-type">{meter.type}</p>
                    </div>
                    <span className="meter-cost">{formatCurrency(meter.costPerUnit)}/unit</span>
                  </div>

                  {/* Consumption Trend for this meter */}
                  {utilityAnalytics.consumptionTrends.find((trend: any) => trend.meterId === meter.id) && (
                    <div className="consumption-trend">
                      <p className="trend-label">Recent Consumption:</p>
                      <div className="trend-data">
                        {utilityAnalytics.consumptionTrends
                          .find((trend: any) => trend.meterId === meter.id)
                          .monthlyConsumption.slice(-3)
                          .map((month: any, index: number) => (
                            <div key={index} className="month-data">
                              <p className="consumption">{month.consumption}</p>
                              <p className="month">{month.month}</p>
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
          <div className="no-meters">
            <div className="no-meters-icon">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="no-meters-text">No utility meters configured for this unit</p>
            <p className="no-meters-subtext">Add meters to track electricity, water, and gas consumption</p>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
};