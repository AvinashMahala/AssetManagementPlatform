import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import {
  ArrowLeft,
  Edit,
  FileImage,
  Home,
  PieChart,
  Settings,
  Receipt,
  Plus,
} from 'lucide-react';
import { useProperty } from '@/features/properties/hooks/useProperties';
import { useUnits } from '@/features/units/hooks/useUnits';
import { useLeases } from '@/features/leases/hooks/useLeases';
import { usePayments } from '@/features/finance/hooks/usePayments';
import { useTenants } from '@/features/tenants/hooks/useTenants';
import { navigateBackOrFallback } from '@/utils/navigation';
import { getErrorMessage } from '@/types/api';
import { PropertyStatsSection } from './PropertyStatsSection';
import { PropertyAlertsSection } from './PropertyAlertsSection';
import { PropertyChartsSection } from './PropertyChartsSection';
import { PropertyTabsSection } from './PropertyTabsSection';
import { PageHeader } from '@/componentDesignLibrary/components/PageHeader';
import './PropertyDashboard.scss';

const PropertyDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: property, loading: propertyLoading, error: propertyError } = useProperty(id!);
  const { units, loading: unitsLoading } = useUnits(id);
  const { leases } = useLeases();
  const { payments } = usePayments();
  const { tenants } = useTenants();

  // State for scroll-triggered animations
  const [revealedSections, setRevealedSections] = useState<Set<string>>(new Set());
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);

  // Refs for scroll-triggered animations
  const headerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered animations
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

    // Observe sections that should animate in on scroll
    const sections = [headerRef, metricsRef, alertsRef, chartsRef, tabsRef];
    sections.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Listen for file deletion events from other components (like FilesPage)
  useEffect(() => {
    const handleFileDeleted = (event: CustomEvent) => {
      // Check if the deleted file belongs to this property
      if (event.detail?.propertyId === id || event.detail?.entityId === id) {
        setFileRefreshTrigger(prev => prev + 1);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'file-deleted' && event.newValue) {
        try {
          // For bulk deletions, check if any of the deleted files belong to this property
          // Since we don't have the file details here, we'll refresh on any file deletion
          // In a more sophisticated implementation, we could check file ownership
          setFileRefreshTrigger(prev => prev + 1);
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    };

    // Listen for custom events
    window.addEventListener('file-deleted', handleFileDeleted as EventListener);
    // Listen for storage events (fallback for cross-tab communication)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('file-deleted', handleFileDeleted as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [id]);

  // Filter leases for this property's units
  const propertyUnitIds = useMemo(() => units.map(u => u.id), [units]);
  const propertyLeases = useMemo(
    () => leases.filter(l => propertyUnitIds.includes(l.unitId)),
    [leases, propertyUnitIds]
  );

  // Filter payments for this property's leases
  const propertyLeaseIds = useMemo(() => propertyLeases.map(l => l.id), [propertyLeases]);
  const propertyPayments = useMemo(
    () => payments.filter(p => propertyLeaseIds.includes(p.leaseId)),
    [payments, propertyLeaseIds]
  );

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const availableUnits = units.filter(u => u.status === 'available').length;
    const maintenanceUnits = units.filter(u => u.status === 'under_maintenance').length;
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0';

    const activeLeases = propertyLeases.filter(l => l.status === 'active');
    const expiringSoonLeases = activeLeases.filter(l => {
      const daysUntilExpiry = Math.ceil((new Date(l.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    const totalMonthlyRent = activeLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0);

    const paidPayments = propertyPayments.filter(p => p.status === 'paid');
    const pendingPayments = propertyPayments.filter(p => p.status === 'pending');
    const overduePayments = propertyPayments.filter(p => {
      if (p.status === 'paid') return false;
      return new Date(p.dueDate) < new Date();
    });

    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    const collectionRate = propertyPayments.length > 0
      ? ((paidPayments.length / propertyPayments.length) * 100).toFixed(1)
      : '0';

    // Revenue trend (last 6 months)
    const revenueTrend = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(monthDate, 'MMM yyyy');
      const monthPayments = paidPayments.filter(p => {
        if (!p.paidDate) return false;
        const paidDate = new Date(p.paidDate);
        return paidDate.getMonth() === monthDate.getMonth() && paidDate.getFullYear() === monthDate.getFullYear();
      });
      const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
      revenueTrend.push({ name: monthKey, value: monthRevenue });
    }

    // Occupancy trend
    const occupancyTrend = [
      { name: 'Occupied', value: occupiedUnits },
      { name: 'Available', value: availableUnits },
      { name: 'Maintenance', value: maintenanceUnits }
    ];

    // Active tenants
    const activeTenantIds = activeLeases.map(l => l.tenantId);
    const activeTenants = tenants.filter(t => activeTenantIds.includes(t.id) && t.status === 'active');

    return {
      totalUnits,
      occupiedUnits,
      availableUnits,
      maintenanceUnits,
      occupancyRate,
      activeLeases: activeLeases.length,
      expiringSoonLeases: expiringSoonLeases.length,
      totalMonthlyRent,
      totalRevenue,
      pendingAmount,
      overdueAmount,
      collectionRate,
      paidPayments: paidPayments.length,
      pendingPayments: pendingPayments.length,
      overduePayments: overduePayments.length,
      revenueTrend,
      occupancyTrend,
      activeTenants: activeTenants.length
    };
  }, [units, propertyLeases, propertyPayments, tenants]);

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${amount.toLocaleString()}`;
  };

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'occupied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'under_maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'reserved': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getLeaseStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'terminated': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
  };

  const getUnitNumber = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.unitNumber : 'N/A';
  };

  if (propertyLoading || unitsLoading) {
    return (
      <AppLayout>
        <div className="property-dashboard-enhanced loading-container flex items-center justify-center min-h-[60vh]">
          <div className="loading-spinner animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (propertyError || !property) {
    return (
      <AppLayout>
        <div className="property-dashboard-enhanced container mx-auto py-6">
          <Card className="error-card border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="error-title text-red-600 dark:text-red-400">Error</CardTitle>
              <CardDescription>{getErrorMessage(propertyError) || 'Property not found'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigateBackOrFallback(navigate, '/properties')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Properties
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="property-dashboard-enhanced container mx-auto py-6">
        {/* Main Navigation Tabs */}
        <Tabs defaultValue="overview" className="main-dashboard-tabs">
          <TabsList className="main-tabs-list grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="main-tab-trigger">
              <Home className="main-tab-icon w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="main-tab-trigger">
              <PieChart className="main-tab-icon w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="management" className="main-tab-trigger">
              <Settings className="main-tab-icon w-4 h-4 mr-2" />
              Management
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="main-tab-content space-y-6">
            {/* Header */}
            <div ref={headerRef} data-section="header">
              <PageHeader
                title={property.name}
                subtitle={`${property.address.city}, ${property.address.state}`}
                backLabel="Back"
                onBack={() => navigateBackOrFallback(navigate, '/properties')}
                actions={
                  <>
                    <Button variant="default" onClick={() => navigate(`/properties/${id}/rent-collection`)}>
                      <Receipt className="w-4 h-4 mr-2" />
                      Rent Collection
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/properties/${id}/edit`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Property
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/properties/${id}/template-customization`)}>
                      <FileImage className="w-4 h-4 mr-2" />
                      Templates
                    </Button>
                    <Button onClick={() => navigate(`/units/create?propertyId=${id}`)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Unit
                    </Button>
                  </>
                }
              />
              <div className="property-badges flex items-center gap-2 mt-2 px-4 sm:px-6 lg:px-8">
                <Badge className={getUnitStatusColor(property.status)}>
                  {property.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {property.propertyType.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Key Metrics */}
            <div
              ref={metricsRef}
              data-section="metrics"
              className="key-metrics"
            >
              <PropertyStatsSection
                metrics={metrics}
                formatCurrency={formatCurrency}
              />
            </div>

            {/* Alerts */}
            <div
              ref={alertsRef}
              data-section="alerts"
              className={`alerts-section scroll-reveal ${revealedSections.has('alerts') ? 'revealed' : ''}`}
            >
              <PropertyAlertsSection
                metrics={metrics}
                formatCurrency={formatCurrency}
                onViewLeases={() => navigate('/leases')}
                onViewPayments={() => navigate('/payments')}
              />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="main-tab-content space-y-6">
            {/* Charts */}
            <div
              ref={chartsRef}
              data-section="charts"
              className={`charts-section scroll-reveal ${revealedSections.has('charts') ? 'revealed' : ''}`}
            >
              <PropertyChartsSection
                revenueTrend={metrics.revenueTrend}
                occupancyTrend={metrics.occupancyTrend}
              />
            </div>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="main-tab-content space-y-6">
            <div
              ref={tabsRef}
              data-section="tabs"
              className={`property-tabs scroll-reveal ${revealedSections.has('tabs') ? 'revealed' : ''}`}
            >
              <PropertyTabsSection
                property={property}
                units={units}
                propertyLeases={propertyLeases}
                propertyPayments={propertyPayments}
                metrics={metrics}
                fileRefreshTrigger={fileRefreshTrigger}
                formatCurrency={formatCurrency}
                getUnitStatusColor={getUnitStatusColor}
                getLeaseStatusColor={getLeaseStatusColor}
                getPaymentStatusColor={getPaymentStatusColor}
                getTenantName={getTenantName}
                getUnitNumber={getUnitNumber}
                onNavigate={navigate}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PropertyDashboard;