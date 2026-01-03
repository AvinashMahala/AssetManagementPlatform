import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/componentDesignLibrary';
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
import { navigateBackOrFallback } from '@/utils/navigation';
import { getErrorMessage } from '@/types/api';
import { PropertyChartsSection } from './PropertyChartsSection';
import { PropertyTabsSection } from './PropertyTabsSection';
import { PageHeader } from '@/componentDesignLibrary/components/PageHeader';
import { usePropertyDashboard } from '@/features/properties/hooks/usePropertyDashboard';
import { useScrollReveal } from '@/features/properties/hooks/useScrollReveal';
import styles from './PropertyDashboard.module.scss';

const PropertyDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    property,
    propertyLoading,
    propertyError,
    units,
    leases,
    payments,
    tenants,
    metrics,
    fileRefreshTrigger
  } = usePropertyDashboard(id!);

  // Scroll-triggered animations
  const { setRef, isRevealed } = useScrollReveal(['header', 'charts', 'tabs']);

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
  
  if (propertyLoading) {
    return (
      <AppLayout>
        <div className={`${styles.loadingContainer} flex items-center justify-center min-h-[60vh]`}>
          <div className={`${styles.loadingSpinner} animate-spin rounded-full h-12 w-12 border-b-2`}></div>
        </div>
      </AppLayout>
    );
  }

  if (propertyError || !property) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card className={styles.errorCard}>
            <CardHeader>
              <CardTitle className={styles.errorTitle}>Error</CardTitle>
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
      <div className="container mx-auto py-6">
        {/* Main Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">
              <Home className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <PieChart className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="management">
              <Settings className="w-4 h-4 mr-2" />
              Management
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Header */}
            <div ref={setRef('header')} data-section="header" className={styles.propertyHeader}>
              <PageHeader
                title={property.name}
                subtitle={`${property.address.city}, ${property.address.state}`}
                backLabel="Back"
                onBack={() => navigateBackOrFallback(navigate, '/properties')}
                actions={
                  <div className={styles.propertyActions}>
                    <Button variant="default" onClick={() => navigate(`/properties/${id}/rent-collection`)} className="mr-2">
                      <Receipt className="w-4 h-4 mr-2" />
                      Rent Collection
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/properties/${id}/edit`)} className="mr-2">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Property
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/properties/${id}/template-customization`)} className="mr-2">
                      <FileImage className="w-4 h-4 mr-2" />
                      Templates
                    </Button>
                    <Button onClick={() => navigate(`/units/create?propertyId=${id}`)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Unit
                    </Button>
                  </div>
                }
              />
              <div className={`${styles.propertyBadges} flex items-center gap-2 mt-2 px-4 sm:px-6 lg:px-8`}>
                <Badge className={getUnitStatusColor(property.status)}>
                  {property.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {property.propertyType.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>





            {/* Units Overview */}
            <div className="units-overview">
              <h3 className="text-lg font-semibold">Units</h3>
              <div className="mt-3">
                {units.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No Units created yet. Create One to see here.</p>
                        <Button onClick={() => navigate(`/units/create?propertyId=${id}`)}>
                          <Plus className="w-4 h-4 mr-2" /> Create Unit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="table-header">
                            <TableHead className="w-[15%] min-w-[120px] py-2 px-3">Unit Number</TableHead>
                            <TableHead className="w-[15%] min-w-[120px] py-2 px-3">Type</TableHead>
                            <TableHead className="w-[15%] min-w-[120px] py-2 px-3">Monthly Rent</TableHead>
                            <TableHead className="w-[10%] min-w-[80px] py-2 px-3">Area</TableHead>
                            <TableHead className="w-[15%] min-w-[140px] py-2 px-3">Status</TableHead>
                            <TableHead className="w-[15%] min-w-[140px] py-2 px-3 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {units.map((unit) => (
                            <TableRow
                              key={unit.id}
                              className={`table-row cursor-pointer ${unit.status === 'available' ? 'bg-green-50 hover:bg-green-100' : ''}`}
                              onClick={() => navigate(`/units/${unit.id}`)}
                            >
                              <TableCell className="py-2 px-3 font-medium">{unit.unitNumber}</TableCell>
                              <TableCell className="py-2 px-3">{unit.unitType}</TableCell>
                              <TableCell className="py-2 px-3">{formatCurrency(unit.monthlyRent)}</TableCell>
                              <TableCell className="py-2 px-3">{unit.area || 'N/A'}</TableCell>
                              <TableCell className="py-2 px-3">
                                <Badge className={getUnitStatusColor(unit.status)}>{unit.status.replace('_', ' ')}</Badge>
                              </TableCell>
                              <TableCell className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/units/${unit.id}`)}>View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Charts */}
            <div
              ref={setRef('charts')}
              data-section="charts"
              className={`${styles.scrollReveal} ${isRevealed('charts') ? styles.revealed : ''}`}
            >
              <PropertyChartsSection
                revenueTrend={metrics.revenueTrend}
                occupancyTrend={metrics.occupancyTrend}
              />
            </div>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <div
              ref={setRef('tabs')}
              data-section="tabs"
              className={`${styles.scrollReveal} ${isRevealed('tabs') ? styles.revealed : ''}`}
            >
              <PropertyTabsSection
                property={property}
                units={units}
                propertyLeases={leases}
                propertyPayments={payments}
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
