import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  FileText,
  DollarSign,
  TrendingUp,
  Home,
  MapPin,
  Edit,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  Layers,
  ParkingCircle,
  Eye,
  BarChart3,
  FileImage,
  Receipt,
} from 'lucide-react';
import { useProperty, useUnits, useLeases, usePayments, useTenants } from '../../hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui';
import { PropertyFileGallery } from '../../components/files';
import {
  RevenueTrendChart,
  PropertyStatusChart
} from '../../components/ui/charts';
import { AppLayout } from '../../components/layout/AppLayout';
import { getErrorMessage } from '../../types/api';

export const PropertyDashboardPageEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: property, loading: propertyLoading, error: propertyError } = useProperty(id!);
  const { units, loading: unitsLoading } = useUnits(id);
  const { leases } = useLeases();
  const { payments } = usePayments();
  const { tenants } = useTenants();

  // State for refreshing file gallery when files are deleted from elsewhere
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);

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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (propertyError || !property) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Error</CardTitle>
              <CardDescription>{getErrorMessage(propertyError) || 'Property not found'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/properties')}>
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
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/properties')}
              className="mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <p>
                  {property.address.street}, {property.address.city}, {property.address.state} {property.address.pincode}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getUnitStatusColor(property.status)}>
                  {property.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {property.propertyType.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
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
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
              <Home className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.totalUnits}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.occupiedUnits} occupied • {metrics.availableUnits} available
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.occupancyRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.activeTenants} active tenants
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(metrics.totalMonthlyRent)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From {metrics.activeLeases} active leases
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.paidPayments} payments collected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(metrics.expiringSoonLeases > 0 || metrics.overduePayments > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            {metrics.expiringSoonLeases > 0 && (
              <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-base">Expiring Soon</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {metrics.expiringSoonLeases} lease{metrics.expiringSoonLeases !== 1 ? 's' : ''} expiring within 30 days
                  </p>
                  <Button
                    variant="link"
                    className="px-0 text-orange-700 dark:text-orange-400"
                    onClick={() => navigate('/leases')}
                  >
                    View Leases →
                  </Button>
                </CardContent>
              </Card>
            )}
            {metrics.overduePayments > 0 && (
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-base">Overdue Payments</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {metrics.overduePayments} payment{metrics.overduePayments !== 1 ? 's' : ''} overdue • {formatCurrency(metrics.overdueAmount)}
                  </p>
                  <Button
                    variant="link"
                    className="px-0 text-red-700 dark:text-red-400"
                    onClick={() => navigate('/payments')}
                  >
                    View Payments →
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
              <CardDescription>Last 6 months revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueTrendChart data={metrics.revenueTrend} height={250} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unit Distribution</CardTitle>
              <CardDescription>Current occupancy status</CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyStatusChart data={metrics.occupancyTrend} height={250} />
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed views */}
        <Tabs defaultValue="units" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="units">
              <Home className="w-4 h-4 mr-2" />
              Units
            </TabsTrigger>
            <TabsTrigger value="leases">
              <FileText className="w-4 h-4 mr-2" />
              Leases
            </TabsTrigger>
            <TabsTrigger value="payments">
              <DollarSign className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="files">
              <FileImage className="w-4 h-4 mr-2" />
              Files
            </TabsTrigger>
            <TabsTrigger value="details">
              <Building2 className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
          </TabsList>

          {/* Units Tab */}
          <TabsContent value="units" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Units in this Property</h3>
                <p className="text-sm text-muted-foreground">
                  {metrics.totalUnits} total units • {metrics.occupiedUnits} occupied
                </p>
              </div>
              <Button size="sm" onClick={() => navigate(`/units/create?propertyId=${id}`)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </div>

            {units.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No units yet</h3>
                    <p className="text-muted-foreground mb-4">Add units to this property to get started.</p>
                    <Button onClick={() => navigate(`/units/create?propertyId=${id}`)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Unit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {units.map((unit) => (
                  <Card key={unit.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Unit {unit.unitNumber}</CardTitle>
                          <CardDescription className="mt-1">
                            {unit.unitType.replace('_', ' ').toUpperCase()}
                          </CardDescription>
                        </div>
                        <Badge className={getUnitStatusColor(unit.status)}>
                          {unit.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Rent</span>
                        <span className="font-semibold">{formatCurrency(unit.monthlyRent)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Area</span>
                        <span className="font-semibold">{unit.area?.toLocaleString() || 'N/A'} sq ft</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Bedrooms</span>
                        <span className="font-semibold">{unit.bedrooms || 'N/A'}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => navigate(`/units/${unit.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Leases Tab */}
          <TabsContent value="leases" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Active Leases</h3>
              <p className="text-sm text-muted-foreground">
                {metrics.activeLeases} active lease agreements
              </p>
            </div>

            {propertyLeases.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No leases</h3>
                    <p className="text-muted-foreground">No lease agreements for this property yet.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {propertyLeases.map((lease) => {
                  const unit = units.find(u => u.id === lease.unitId);
                  const daysUntilExpiry = Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

                  return (
                    <Card key={lease.id} className={`hover:shadow-md transition-shadow ${isExpiringSoon ? 'border-orange-200 dark:border-orange-800' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">Unit {unit?.unitNumber || 'N/A'}</CardTitle>
                            <CardDescription className="mt-1">
                              {getTenantName(lease.tenantId)}
                            </CardDescription>
                          </div>
                          <Badge className={getLeaseStatusColor(lease.status)}>
                            {lease.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Monthly Rent</p>
                            <p className="font-semibold">{formatCurrency(lease.monthlyRent)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Security Deposit</p>
                            <p className="font-semibold">{formatCurrency(lease.securityDeposit)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">{format(new Date(lease.startDate), 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">{format(new Date(lease.endDate), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                        {isExpiringSoon && (
                          <div className="mt-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">Expires in {daysUntilExpiry} days</span>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => navigate(`/leases/${lease.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Lease
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            {/* Payment Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{metrics.paidPayments} payments</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div className="text-2xl font-bold text-yellow-600">{formatCurrency(metrics.pendingAmount)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{metrics.pendingPayments} payments</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.overdueAmount)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{metrics.overduePayments} payments</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Collection Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <div className="text-2xl font-bold">{metrics.collectionRate}%</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">of total payments</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Payments */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Payments</h3>
              {propertyPayments.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No payments</h3>
                      <p className="text-muted-foreground">No payment records for this property yet.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {propertyPayments.slice(0, 10).map((payment) => {
                    const lease = propertyLeases.find(l => l.id === payment.leaseId);
                    const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

                    return (
                      <Card key={payment.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div>
                                <p className="font-semibold">Unit {getUnitNumber(lease?.unitId || '')}</p>
                                <p className="text-sm text-muted-foreground">
                                  {lease ? getTenantName(lease.tenantId) : 'Unknown'}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Amount: </span>
                                  <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Due: </span>
                                  <span>{format(new Date(payment.dueDate), 'MMM dd, yyyy')}</span>
                                </div>
                                {payment.paidDate && (
                                  <div>
                                    <span className="text-muted-foreground">Paid: </span>
                                    <span>{format(new Date(payment.paidDate), 'MMM dd, yyyy')}</span>
                                  </div>
                                )}
                              </div>
                              {isOverdue && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                  <AlertCircle className="h-4 w-4" />
                                  <span className="text-sm">Overdue</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={getPaymentStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/payments/${payment.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Property Files & Documents
                </CardTitle>
                <CardDescription>
                  Upload and manage photos and documents for this property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyFileGallery
                  propertyId={id!}
                  refreshTrigger={fileRefreshTrigger}
                  onFileDeleted={(fileId: string) => {
                    console.log('File deleted:', fileId);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Property Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-medium">{property.propertyType.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getUnitStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year Built</p>
                      <p className="font-medium">{property.yearBuilt || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Floors</p>
                      <p className="font-medium flex items-center gap-1">
                        <Layers className="h-4 w-4" />
                        {property.totalFloors || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Area</p>
                      <p className="font-medium">{property.totalArea?.toLocaleString() || 'N/A'} sq ft</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Parking Spaces</p>
                      <p className="font-medium flex items-center gap-1">
                        <ParkingCircle className="h-4 w-4" />
                        {property.parkingSpaces || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalMonthlyRent)}</p>
                    <p className="text-xs text-muted-foreground mt-1">From active leases</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-semibold">{formatCurrency(metrics.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground mt-1">All-time collections</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Collections</p>
                    <p className="text-xl font-semibold text-yellow-600">{formatCurrency(metrics.pendingAmount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Outstanding payments</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Rent per Unit</p>
                    <p className="text-xl font-semibold">
                      {metrics.totalUnits > 0 ? formatCurrency(metrics.totalMonthlyRent / metrics.totalUnits) : formatCurrency(0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Per occupied unit</p>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{property.address.street}</p>
                    <p className="text-muted-foreground">
                      {property.address.city}, {property.address.state} {property.address.pincode}
                    </p>
                    {property.address.landmark && (
                      <p className="text-sm text-muted-foreground">Landmark: {property.address.landmark}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};
