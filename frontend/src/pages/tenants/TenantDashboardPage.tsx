import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  User,
  FileText,
  DollarSign,
  TrendingUp,
  Home,
  Edit,
  Eye,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Building2,
  Settings
} from 'lucide-react';
import { useTenant, useLeases, usePayments, useProperties, useUnits } from '../../hooks';
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
import { AppLayout } from '../../components/layout/AppLayout';
import { getErrorMessage } from '../../types/api';
import { RevenueTrendChart, PaymentCollectionChart } from '../../components/ui/charts';

export const TenantDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tenant, loading: tenantLoading, error: tenantError } = useTenant(id!);
  const { leases } = useLeases();
  const { payments } = usePayments();
  const { properties } = useProperties();
  const { units } = useUnits();

  // Filter data for this tenant
  const tenantLeases = useMemo(
    () => leases.filter(l => l.tenantId === id),
    [leases, id]
  );

  const tenantPayments = useMemo(() => {
    const leaseIds = tenantLeases.map(l => l.id);
    return payments.filter(p => leaseIds.includes(p.leaseId));
  }, [payments, tenantLeases]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeLeases = tenantLeases.filter(l => l.status === 'active');
    const currentLease = activeLeases[0]; // Assuming one active lease per tenant

    const totalLeases = tenantLeases.length;
    const activeLeaseCount = activeLeases.length;

    // Payment metrics
    const paidPayments = tenantPayments.filter(p => p.status === 'paid');
    const pendingPayments = tenantPayments.filter(p => p.status === 'pending');
    const overduePayments = tenantPayments.filter(p => {
      if (p.status === 'paid') return false;
      return new Date(p.dueDate) < new Date();
    });

    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);

    // Payment trend (last 6 months)
    const paymentTrend = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(monthDate, 'MMM yyyy');
      const monthPayments = paidPayments.filter(p => {
        if (!p.paidDate) return false;
        const paidDate = new Date(p.paidDate);
        return paidDate.getMonth() === monthDate.getMonth() && paidDate.getFullYear() === monthDate.getFullYear();
      });
      const monthAmount = monthPayments.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
      paymentTrend.push({ name: monthKey, value: monthAmount });
    }

    // Lease status distribution
    const leaseStatusData = [
      { name: 'Active', value: tenantLeases.filter(l => l.status === 'active').length },
      { name: 'Expired', value: tenantLeases.filter(l => l.status === 'expired').length },
      { name: 'Terminated', value: tenantLeases.filter(l => l.status === 'terminated').length },
    ];

    // Current property and unit info
    const currentProperty = currentLease ? properties.find(p => p.id === currentLease.propertyId) : null;
    const currentUnit = currentLease ? units.find(u => u.id === currentLease.unitId) : null;

    return {
      totalLeases,
      activeLeaseCount,
      currentLease,
      currentProperty,
      currentUnit,
      totalPaid,
      pendingAmount,
      overdueAmount,
      paidPayments: paidPayments.length,
      pendingPayments: pendingPayments.length,
      overduePayments: overduePayments.length,
      paymentTrend,
      leaseStatusData,
      onTimePaymentRate: tenantPayments.length > 0
        ? ((paidPayments.length / tenantPayments.length) * 100).toFixed(1)
        : '0',
    };
  }, [tenantLeases, tenantPayments, properties, units]);

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${amount.toLocaleString()}`;
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

  if (tenantLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (tenantError || !tenant) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Error</CardTitle>
              <CardDescription>{getErrorMessage(tenantError) || 'Tenant not found'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/tenants')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tenants
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
        {/* Main 3-Tab Layout */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/tenants')}
                  className="mt-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{tenant.firstName} {tenant.lastName}</h1>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <p>{tenant.email}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                      {tenant.status.toUpperCase()}
                    </Badge>
                    {tenant.occupation && (
                      <Badge variant="outline">
                        {tenant.occupation}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(`/tenants/${id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" onClick={() => navigate(`/tenants/${id}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Tenant
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Leases</CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.totalLeases}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.activeLeaseCount} currently active
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(metrics.totalPaid)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.paidPayments} payments made
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
                  <Clock className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(metrics.pendingAmount)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.pendingPayments} pending payments
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">On-Time Rate</CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.onTimePaymentRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment reliability
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Current Lease Information */}
            {metrics.currentLease && (
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    Current Lease
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-semibold">{metrics.currentProperty?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unit</p>
                      <p className="font-semibold">{metrics.currentUnit ? `Unit ${metrics.currentUnit.unitNumber}` : 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rent</p>
                      <p className="font-semibold text-green-600">{formatCurrency(metrics.currentLease.monthlyRent)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lease Period</p>
                      <p className="font-semibold">
                        {format(new Date(metrics.currentLease.startDate), 'MMM dd, yyyy')} - {format(new Date(metrics.currentLease.endDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getLeaseStatusColor(metrics.currentLease.status)}>
                        {metrics.currentLease.status}
                      </Badge>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/leases/${metrics.currentLease.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Lease
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alerts */}
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
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Payment Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Payment Trend
                  </CardTitle>
                  <CardDescription>Monthly payment amounts over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueTrendChart data={metrics.paymentTrend} height={250} />
                </CardContent>
              </Card>

              {/* Payment Collection Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Payment Status
                  </CardTitle>
                  <CardDescription>Collected vs pending payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentCollectionChart
                    data={[
                      {
                        name: 'Current Month',
                        collected: metrics.totalPaid,
                        pending: metrics.pendingAmount
                      }
                    ]}
                    height={250}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Lease Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Lease Status Distribution
                </CardTitle>
                <CardDescription>Overview of lease statuses for this tenant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {metrics.leaseStatusData.map((status) => (
                    <div key={status.name} className="text-center">
                      <div className="text-2xl font-bold">{status.value}</div>
                      <div className="text-sm text-muted-foreground capitalize">{status.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-4">
            <Tabs defaultValue="leases" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="leases">
                  <FileText className="w-4 h-4 mr-2" />
                  Leases
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="details">
                  <User className="w-4 h-4 mr-2" />
                  Details
                </TabsTrigger>
              </TabsList>

              {/* Leases Sub-tab */}
              <TabsContent value="leases" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Lease History</h3>
                  <p className="text-sm text-muted-foreground">
                    {metrics.totalLeases} lease{metrics.totalLeases !== 1 ? 's' : ''} for this tenant
                  </p>
                </div>

                {tenantLeases.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No leases</h3>
                        <p className="text-muted-foreground">No lease agreements for this tenant yet.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {tenantLeases.map((lease) => {
                      const property = properties.find(p => p.id === lease.propertyId);
                      const unit = units.find(u => u.id === lease.unitId);
                      const daysUntilExpiry = Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

                      return (
                        <Card key={lease.id} className={`hover:shadow-md transition-shadow ${isExpiringSoon ? 'border-orange-200 dark:border-orange-800' : ''}`}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">
                                  {property?.name || 'Unknown Property'} - {unit ? `Unit ${unit.unitNumber}` : 'Unknown Unit'}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {format(new Date(lease.startDate), 'MMM dd, yyyy')} - {format(new Date(lease.endDate), 'MMM dd, yyyy')}
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

              {/* Payments Sub-tab */}
              <TabsContent value="payments" className="space-y-4">
                {/* Payment Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalPaid)}</div>
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
                      <CardTitle className="text-sm font-medium text-muted-foreground">On-Time Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <div className="text-2xl font-bold">{metrics.onTimePaymentRate}%</div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">of total payments</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Payments */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment History</h3>
                  {tenantPayments.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No payments</h3>
                          <p className="text-muted-foreground">No payment records for this tenant yet.</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {tenantPayments.slice(0, 10).map((payment) => {
                        const lease = tenantLeases.find(l => l.id === payment.leaseId);
                        const property = lease ? properties.find(p => p.id === lease.propertyId) : null;
                        const unit = lease ? units.find(u => u.id === lease.unitId) : null;
                        const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

                        return (
                          <Card key={payment.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <div>
                                    <p className="font-semibold">
                                      {property?.name || 'Unknown'} - {unit ? `Unit ${unit.unitNumber}` : 'Unknown'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Due: {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Amount: </span>
                                      <span className="font-semibold">{formatCurrency(payment.amount)}</span>
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

              {/* Details Sub-tab */}
              <TabsContent value="details" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">{tenant.firstName} {tenant.lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{tenant.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{tenant.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Alternate Phone</p>
                          <p className="font-medium">{tenant.alternatePhone || 'N/A'}</p>
                        </div>
                        {tenant.dateOfBirth && (
                          <div>
                            <p className="text-sm text-muted-foreground">Date of Birth</p>
                            <p className="font-medium">{format(new Date(tenant.dateOfBirth), 'MMM dd, yyyy')}</p>
                          </div>
                        )}
                        {tenant.gender && (
                          <div>
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-medium capitalize">{tenant.gender}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Employment Information */}
                  {(tenant.occupation || tenant.companyName || tenant.monthlyIncome) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Employment Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {tenant.occupation && (
                          <div>
                            <p className="text-sm text-muted-foreground">Occupation</p>
                            <p className="font-medium">{tenant.occupation}</p>
                          </div>
                        )}
                        {tenant.companyName && (
                          <div>
                            <p className="text-sm text-muted-foreground">Company</p>
                            <p className="font-medium">{tenant.companyName}</p>
                          </div>
                        )}
                        {tenant.monthlyIncome && (
                          <div>
                            <p className="text-sm text-muted-foreground">Monthly Income</p>
                            <p className="font-medium">{formatCurrency(tenant.monthlyIncome)}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Current Address */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Current Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{tenant.currentAddress.street}</p>
                        <p className="text-muted-foreground">
                          {tenant.currentAddress.city}, {tenant.currentAddress.state} {tenant.currentAddress.pincode}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Permanent Address */}
                  {tenant.permanentAddress && (
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Home className="h-5 w-5" />
                          Permanent Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="font-medium">{tenant.permanentAddress.street}</p>
                          <p className="text-muted-foreground">
                            {tenant.permanentAddress.city}, {tenant.permanentAddress.state} {tenant.permanentAddress.pincode}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Emergency Contact */}
                  {tenant.emergencyContact && (
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Emergency Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{tenant.emergencyContact.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Relationship</p>
                            <p className="font-medium">{tenant.emergencyContact.relationship}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{tenant.emergencyContact.phone}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};