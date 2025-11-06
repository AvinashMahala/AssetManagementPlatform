import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, DollarSign, AlertCircle, Clock, Download, Eye, Edit, Calendar, TrendingUp, User, Home, FileImage } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { usePayments } from '../../hooks/usePayments';
import { useTenants } from '../../hooks/useTenants';
import { useLeases } from '../../hooks/useLeases';
import { useUnits } from '../../hooks/useUnits';
import { AppLayout } from '../../components/layout';
import { format } from 'date-fns';

const PaymentListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const { payments, loading } = usePayments();
  const { tenants } = useTenants();
  const { leases } = useLeases();
  const { units } = useUnits();

  // Helper functions
  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
  };

  const getLeaseInfo = (leaseId: string) => {
    const lease = leases.find(l => l.id === leaseId);
    if (!lease) return { unitNumber: 'Unknown', unitId: '' };
    
    const unit = units.find(u => u.id === lease.unitId);
    return {
      unitNumber: unit?.unitNumber || 'Unknown',
      unitId: lease.unitId
    };
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredPayments = Array.isArray(payments) ? payments.filter(p => {
    const tenantName = getTenantName(p.tenantId);
    const { unitNumber } = getLeaseInfo(p.leaseId);
    const matchesSearch = `${tenantName} ${unitNumber}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'overdue' ? isOverdue(p.dueDate, p.status) : p.status === statusFilter);
    const matchesMethod = paymentMethodFilter === 'all' || p.paymentMethod === paymentMethodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  }) : [];

  const totalCollected = Array.isArray(payments) ? payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) : 0;
  const paidCount = Array.isArray(payments) ? payments.filter(p => p.status === 'paid').length : 0;
  const pendingCount = Array.isArray(payments) ? payments.filter(p => p.status === 'pending').length : 0;
  const overdueCount = Array.isArray(payments) ? payments.filter(p => p.status === 'pending' && isOverdue(p.dueDate, p.status)).length : 0;
  const pendingAmount = Array.isArray(payments) ? payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) : 0;

  const stats = [
    { 
      label: 'Total Collected', 
      value: `₹${(totalCollected / 100000).toFixed(1)}L`, 
      icon: DollarSign, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      subtext: `${paidCount} payments`
    },
    { 
      label: 'Pending', 
      value: `₹${(pendingAmount / 1000).toFixed(0)}K`, 
      icon: Clock, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      subtext: `${pendingCount} payments`
    },
    { 
      label: 'Overdue', 
      value: overdueCount.toString(), 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      subtext: 'Requires attention'
    },
    { 
      label: 'Collection Rate', 
      value: `${Array.isArray(payments) && payments.length > 0 ? ((paidCount / payments.length) * 100).toFixed(0) : 0}%`, 
      icon: TrendingUp, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      subtext: 'This month'
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'credit_card', label: 'Credit Card' },
  ];

  const getStatusVariant = (payment: any): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (isOverdue(payment.dueDate, payment.status)) return 'destructive';
    switch (payment.status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (payment: any): string => {
    if (isOverdue(payment.dueDate, payment.status)) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
    switch (payment.status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (payment: any): string => {
    if (isOverdue(payment.dueDate, payment.status)) return 'Overdue';
    return payment.status.charAt(0).toUpperCase() + payment.status.slice(1);
  };

  // Group payments by month for calendar view
  const paymentsByMonth = useMemo(() => {
    const grouped: { [key: string]: typeof payments } = {};
    filteredPayments.forEach(payment => {
      const monthKey = format(new Date(payment.dueDate), 'MMMM yyyy');
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(payment);
    });
    return grouped;
  }, [filteredPayments]);

  return (
    <AppLayout title="Payments">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Track Rent & Payments</h1>
            <p className="text-muted-foreground">Monitor rental payments and financial records</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/templates')} size="lg">
              <FileImage className="mr-2 h-4 w-4" /> Templates
            </Button>
            <Button onClick={() => navigate('/payments/create')} size="lg">
              <Plus className="mr-2 h-4 w-4" /> Record Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overdue Alert */}
        {overdueCount > 0 && (
          <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-900 dark:text-red-300">
                  {overdueCount} Overdue Payment(s)
                </CardTitle>
              </div>
              <CardDescription className="text-red-800 dark:text-red-200">
                Follow up with tenants for overdue payments
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by tenant name, unit..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentMethodOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          {search ? 'No payments found matching your search.' : 'No payments recorded yet. Click "Record Payment" to add one.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => {
                        const { unitNumber } = getLeaseInfo(payment.leaseId);
                        const tenantName = getTenantName(payment.tenantId);
                        const overdue = isOverdue(payment.dueDate, payment.status);
                        
                        return (
                          <TableRow 
                            key={payment.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/payments/${payment.id}`)}
                          >
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{tenantName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                <span>{unitNumber}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-primary">
                              ₹{payment.amount?.toLocaleString() || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                                </div>
                                {overdue && (
                                  <div className="text-xs text-red-600 font-medium">
                                    {Math.abs(Math.ceil((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24)))} days overdue
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">
                              {payment.paymentMethod?.replace('_', ' ') || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(payment)} className={getStatusColor(payment)}>
                                {getStatusLabel(payment)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/payments/${payment.id}`);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/payments/${payment.id}/edit`);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        {Object.keys(paymentsByMonth).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>Payment breakdown by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(paymentsByMonth).slice(0, 3).map(([month, monthPayments]) => {
                  const monthTotal = monthPayments.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0);
                  const monthPending = monthPayments.reduce((sum, p) => sum + (p.status === 'pending' ? p.amount : 0), 0);
                  
                  return (
                    <div key={month} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{month}</p>
                          <p className="text-sm text-muted-foreground">{monthPayments.length} payments</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{monthTotal.toLocaleString()}</p>
                        {monthPending > 0 && (
                          <p className="text-sm text-orange-600">₹{monthPending.toLocaleString()} pending</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default PaymentListPageEnhanced;
