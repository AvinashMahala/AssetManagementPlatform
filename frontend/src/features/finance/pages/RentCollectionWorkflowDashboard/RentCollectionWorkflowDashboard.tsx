import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  Mail,
  Receipt,
  DollarSign,
  Building,
  TrendingUp,
  Search,
  Eye,
  Send,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import { AppLayout } from '@/components/layout';
import { useProperties, useRentTransactions, useTenants, useUnits } from '@/hooks';
import { formatCurrency } from '@/utils/formatters';
import { RentCollectionWorkflowStatus } from '@/features/finance/types';
import type { RentCollectionWorkflowStatusType } from '@/features/finance/types';

export const RentCollectionWorkflowDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { properties, loading: propertiesLoading } = useProperties();
  const { transactions, loading: transactionsLoading } = useRentTransactions();
  const { loading: tenantsLoading } = useTenants();
  const { units, loading: unitsLoading } = useUnits();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // Get workflow status info
  const getWorkflowStatusInfo = (status: RentCollectionWorkflowStatusType) => {
    switch (status) {
      case RentCollectionWorkflowStatus.INVOICE_GENERATED:
        return {
          label: 'Invoice Generated',
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          description: 'Invoice created, awaiting notification'
        };
      case RentCollectionWorkflowStatus.NOTIFICATION_SENT:
        return {
          label: 'Notification Sent',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Mail,
          description: 'Invoice notification sent to tenant'
        };
      case RentCollectionWorkflowStatus.PAYMENT_PENDING:
        return {
          label: 'Payment Pending',
          color: 'bg-orange-100 text-orange-800',
          icon: Clock,
          description: 'Waiting for payment'
        };
      case RentCollectionWorkflowStatus.PAYMENT_PARTIAL:
        return {
          label: 'Partial Payment',
          color: 'bg-purple-100 text-purple-800',
          icon: CreditCard,
          description: 'Partial payment recorded'
        };
      case RentCollectionWorkflowStatus.PAYMENT_COMPLETED:
        return {
          label: 'Payment Complete',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          description: 'Full payment recorded'
        };
      case RentCollectionWorkflowStatus.RECEIPT_GENERATED:
        return {
          label: 'Receipt Generated',
          color: 'bg-emerald-100 text-emerald-800',
          icon: Receipt,
          description: 'Receipt generated and sent'
        };
      case RentCollectionWorkflowStatus.INVOICE_PENDING:
        return {
          label: 'Invoice Pending',
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          description: 'Invoice not yet generated'
        };
      case RentCollectionWorkflowStatus.WORKFLOW_COMPLETED:
        return {
          label: 'Workflow Completed',
          color: 'bg-emerald-100 text-emerald-800',
          icon: CheckCircle,
          description: 'Entire workflow finished'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          description: 'Unknown status'
        };
    }
  };

  // Filter and process transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      const searchMatch = searchTerm === '' ||
        transaction.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tenant?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tenant?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        units.find(u => u.id === transaction.unitId)?.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === 'all' || transaction.workflowStatus === statusFilter;

      // Property filter
      const propertyMatch = propertyFilter === 'all' ||
        units.find(u => u.id === transaction.unitId)?.propertyId === propertyFilter;

      return searchMatch && statusMatch && propertyMatch;
    });
  }, [transactions, searchTerm, statusFilter, propertyFilter, units]);

  // Calculate workflow statistics
  const workflowStats = useMemo(() => {
    const stats = {
      total: transactions.length,
      invoicePending: 0,
      invoiceGenerated: 0,
      notificationSent: 0,
      paymentPending: 0,
      paymentPartial: 0,
      paymentCompleted: 0,
      receiptGenerated: 0,
      workflowCompleted: 0,
      totalAmount: 0,
      collectedAmount: 0,
      pendingAmount: 0
    };

    transactions.forEach(transaction => {
      stats.totalAmount += transaction.totalAmount;
      stats.collectedAmount += transaction.amountPaid || 0;
      stats.pendingAmount += transaction.newBalance || 0;

      switch (transaction.workflowStatus) {
        case RentCollectionWorkflowStatus.INVOICE_PENDING:
          stats.invoicePending++;
          break;
        case RentCollectionWorkflowStatus.INVOICE_GENERATED:
          stats.invoiceGenerated++;
          break;
        case RentCollectionWorkflowStatus.NOTIFICATION_SENT:
          stats.notificationSent++;
          break;
        case RentCollectionWorkflowStatus.PAYMENT_PENDING:
          stats.paymentPending++;
          break;
        case RentCollectionWorkflowStatus.PAYMENT_PARTIAL:
          stats.paymentPartial++;
          break;
        case RentCollectionWorkflowStatus.PAYMENT_COMPLETED:
          stats.paymentCompleted++;
          break;
        case RentCollectionWorkflowStatus.RECEIPT_GENERATED:
          stats.receiptGenerated++;
          break;
        case RentCollectionWorkflowStatus.WORKFLOW_COMPLETED:
          stats.workflowCompleted++;
          break;
      }
    });

    return stats;
  }, [transactions]);

  // Group transactions by property
  const transactionsByProperty = useMemo(() => {
    const grouped: { [propertyId: string]: typeof transactions } = {};

    filteredTransactions.forEach(transaction => {
      const unit = units.find(u => u.id === transaction.unitId);
      const propertyId = unit?.propertyId || 'unknown';

      if (!grouped[propertyId]) {
        grouped[propertyId] = [];
      }
      grouped[propertyId].push(transaction);
    });

    return grouped;
  }, [filteredTransactions, units]);

  const handleViewTransaction = (transactionId: string) => {
    // Navigate directly to the payment recording page for this transaction
    navigate(`/rent-transactions/${transactionId}/record-payment`);
  };

  const handleBulkNotification = (type: 'invoice' | 'receipt' | 'reminder', propertyId?: string) => {
    // Navigate to bulk operations with pre-selected filters
    navigate('/bulk-operations', {
      state: {
        operationType: 'rent-collection',
        notificationType: type,
        propertyId
      }
    });
  };

  if (propertiesLoading || transactionsLoading || tenantsLoading || unitsLoading) {
    return (
      <AppLayout title="Rent Collection Workflow Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading workflow data...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Rent Collection Workflow Dashboard">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Rent Collection Workflow Dashboard</h1>
            <p className="mt-2 text-gray-600">Monitor and manage rent collection workflows across all properties</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleBulkNotification('invoice')}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Bulk Invoice Notifications
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkNotification('reminder')}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Bulk Payment Reminders
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by invoice number, tenant name, or unit number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={RentCollectionWorkflowStatus.INVOICE_PENDING}>Invoice Pending</SelectItem>
                  <SelectItem value={RentCollectionWorkflowStatus.INVOICE_GENERATED}>Invoice Generated</SelectItem>
                  <SelectItem value={RentCollectionWorkflowStatus.NOTIFICATION_SENT}>Notification Sent</SelectItem>
                  <SelectItem value={RentCollectionWorkflowStatus.PAYMENT_PENDING}>Payment Pending</SelectItem>
                  <SelectItem value={RentCollectionWorkflowStatus.PAYMENT_PARTIAL}>Partial Payment</SelectItem>
                  <SelectItem value={RentCollectionWorkflowStatus.PAYMENT_COMPLETED}>Payment Complete</SelectItem>
                  <SelectItem value={RentCollectionWorkflowStatus.RECEIPT_GENERATED}>Receipt Generated</SelectItem>
                  <SelectItem value={RentCollectionWorkflowStatus.WORKFLOW_COMPLETED}>Workflow Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflowStats.total}</div>
              <p className="text-xs text-gray-600 mt-1">Active rent collection processes</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{workflowStats.receiptGenerated}</div>
              <p className="text-xs text-gray-600 mt-1">Receipts generated</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Collection</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {workflowStats.invoiceGenerated + workflowStats.notificationSent + workflowStats.paymentPending}
              </div>
              <p className="text-xs text-gray-600 mt-1">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">0</div>
              <p className="text-xs text-gray-600 mt-1">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expected</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(workflowStats.totalAmount)}</div>
              <p className="text-xs text-gray-600 mt-1">Across all transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Collected</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(workflowStats.collectedAmount)}</div>
              <p className="text-xs text-gray-600 mt-1">
                {workflowStats.totalAmount > 0 ? ((workflowStats.collectedAmount / workflowStats.totalAmount) * 100).toFixed(1) : 0}% collection rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(workflowStats.pendingAmount)}</div>
              <p className="text-xs text-gray-600 mt-1">Outstanding balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.values(RentCollectionWorkflowStatus).map(status => {
                const count = (() => {
                  switch (status) {
                    case RentCollectionWorkflowStatus.INVOICE_PENDING: return workflowStats.invoicePending;
                    case RentCollectionWorkflowStatus.INVOICE_GENERATED: return workflowStats.invoiceGenerated;
                    case RentCollectionWorkflowStatus.NOTIFICATION_SENT: return workflowStats.notificationSent;
                    case RentCollectionWorkflowStatus.PAYMENT_PENDING: return workflowStats.paymentPending;
                    case RentCollectionWorkflowStatus.PAYMENT_PARTIAL: return workflowStats.paymentPartial;
                    case RentCollectionWorkflowStatus.PAYMENT_COMPLETED: return workflowStats.paymentCompleted;
                    case RentCollectionWorkflowStatus.RECEIPT_GENERATED: return workflowStats.receiptGenerated;
                    case RentCollectionWorkflowStatus.WORKFLOW_COMPLETED: return workflowStats.workflowCompleted;
                    default: return 0;
                  }
                })();

                const statusInfo = getWorkflowStatusInfo(status);
                const Icon = statusInfo.icon;

                return (
                  <div key={status} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Icon className="h-8 w-8 text-gray-600" />
                    <div>
                      <div className="font-medium">{count}</div>
                      <div className="text-sm text-gray-600">{statusInfo.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Transactions by Property */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Properties</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="pending">Pending Payment</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {Object.entries(transactionsByProperty).map(([propertyId, propertyTransactions]) => {
              const property = properties.find(p => p.id === propertyId);
              return (
                <Card key={propertyId}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {property?.name || 'Unknown Property'}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkNotification('invoice', propertyId)}
                        >
                          Send Invoices
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkNotification('reminder', propertyId)}
                        >
                          Send Reminders
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {propertyTransactions.slice(0, 5).map(transaction => {
                        const unit = units.find(u => u.id === transaction.unitId);
                        const tenantName = transaction.tenant ? `${transaction.tenant.firstName} ${transaction.tenant.lastName}` : 'Vacant';
                        const statusInfo = getWorkflowStatusInfo(transaction.workflowStatus || RentCollectionWorkflowStatus.INVOICE_GENERATED);

                        return (
                          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <statusInfo.icon className="h-5 w-5 text-gray-600" />
                              <div>
                                <div className="font-medium">Unit {unit?.unitNumber || 'Unknown'}</div>
                                <div className="text-sm text-gray-600">{tenantName}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className="font-medium">{formatCurrency(transaction.totalAmount)}</div>
                                <div className="text-sm text-gray-600">
                                  Paid: {formatCurrency(transaction.amountPaid || 0)}
                                </div>
                              </div>
                              <Badge className={statusInfo.color}>
                                {statusInfo.label}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewTransaction(transaction.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      {propertyTransactions.length > 5 && (
                        <div className="text-center text-sm text-gray-600">
                          And {propertyTransactions.length - 5} more transactions...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Overdue Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-600 py-8">
                  No overdue transactions found. Overdue tracking will be implemented in future updates.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Pending Payment Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTransactions
                    .filter(t => {
                      const status = t.workflowStatus || RentCollectionWorkflowStatus.INVOICE_GENERATED;
                      return status === RentCollectionWorkflowStatus.INVOICE_GENERATED ||
                             status === RentCollectionWorkflowStatus.NOTIFICATION_SENT ||
                             status === RentCollectionWorkflowStatus.PAYMENT_PENDING;
                    })
                    .map(transaction => {
                      const unit = units.find(u => u.id === transaction.unitId);
                      const property = properties.find(p => p.id === unit?.propertyId);
                      const tenantName = transaction.tenant ? `${transaction.tenant.firstName} ${transaction.tenant.lastName}` : 'Vacant';
                      const statusInfo = getWorkflowStatusInfo(transaction.workflowStatus || RentCollectionWorkflowStatus.INVOICE_GENERATED);

                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                          <div className="flex items-center space-x-3">
                            <statusInfo.icon className="h-5 w-5 text-orange-600" />
                            <div>
                              <div className="font-medium">{property?.name} - Unit {unit?.unitNumber}</div>
                              <div className="text-sm text-gray-600">{tenantName}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(transaction.newBalance || transaction.totalAmount)}</div>
                              <div className="text-sm text-gray-600">Pending</div>
                            </div>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewTransaction(transaction.id)}
                            >
                              Record Payment
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  {filteredTransactions.filter(t => {
                    const status = t.workflowStatus || RentCollectionWorkflowStatus.INVOICE_GENERATED;
                    return status === RentCollectionWorkflowStatus.INVOICE_GENERATED ||
                           status === RentCollectionWorkflowStatus.NOTIFICATION_SENT ||
                           status === RentCollectionWorkflowStatus.PAYMENT_PENDING;
                  }).length === 0 && (
                    <div className="text-center text-gray-600 py-8">
                      No pending payment transactions found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Completed Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTransactions
                    .filter(t => t.workflowStatus === RentCollectionWorkflowStatus.RECEIPT_GENERATED)
                    .slice(0, 10)
                    .map(transaction => {
                      const unit = units.find(u => u.id === transaction.unitId);
                      const property = properties.find(p => p.id === unit?.propertyId);
                      const tenantName = transaction.tenant ? `${transaction.tenant.firstName} ${transaction.tenant.lastName}` : 'Vacant';

                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <div className="font-medium">{property?.name} - Unit {unit?.unitNumber}</div>
                              <div className="text-sm text-gray-600">{tenantName}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="font-medium text-green-600">{formatCurrency(transaction.amountPaid || 0)}</div>
                              <div className="text-sm text-gray-600">Paid in full</div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewTransaction(transaction.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  {filteredTransactions.filter(t => t.workflowStatus === RentCollectionWorkflowStatus.RECEIPT_GENERATED).length > 10 && (
                    <div className="text-center text-sm text-gray-600">
                      And {filteredTransactions.filter(t => t.workflowStatus === RentCollectionWorkflowStatus.RECEIPT_GENERATED).length - 10} more completed transactions...
                    </div>
                  )}
                  {filteredTransactions.filter(t => t.workflowStatus === RentCollectionWorkflowStatus.RECEIPT_GENERATED).length === 0 && (
                    <div className="text-center text-gray-600 py-8">
                      No completed transactions found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};