import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, DollarSign, Receipt, AlertCircle, CheckCircle, Clock, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { AppLayout } from '../../components/layout';
import { useProperty, useUnits, useRentTransactions } from '../../hooks';
import { formatCurrency, formatMonthYear } from '../../utils/billingCalculations';
import { RentCollectionCalendar } from '../../components/rentCollection/RentCollectionCalendar';

export const PropertyRentCollectionPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  
  const { data: property, loading: propertyLoading } = useProperty(propertyId!);
  const { units, loading: unitsLoading } = useUnits();
  const { transactions, loading: transactionsLoading } = useRentTransactions(propertyId);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [billingMethod, setBillingMethod] = useState<'relative' | 'fixed'>('relative');

  // Convert selectedMonth to Date for calendar
  const selectedDate = new Date(selectedMonth + '-01');

  // Filter units for this property
  const propertyUnits = units.filter(u => u.propertyId === propertyId);

  // Get transaction status for each unit
  const getUnitTransactionStatus = (unitId: string) => {
    const transaction = transactions.find(
      t => t.unitId === unitId && 
      t.billingPeriodStart.startsWith(selectedMonth)
    );

    if (!transaction) {
      return {
        status: 'not_started',
        label: 'Not Started',
        color: 'bg-gray-100 text-gray-800',
        icon: Clock,
        transaction: null
      };
    }

    if (transaction.status === 'paid') {
      return {
        status: 'paid',
        label: 'Paid',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        transaction
      };
    }

    if (transaction.status === 'pending') {
      return {
        status: 'pending',
        label: 'Invoice Sent',
        color: 'bg-blue-100 text-blue-800',
        icon: FileText,
        transaction
      };
    }

    if (transaction.status === 'partial') {
      return {
        status: 'partial',
        label: 'Partial Paid',
        color: 'bg-yellow-100 text-yellow-800',
        icon: DollarSign,
        transaction
      };
    }

    if (transaction.status === 'overdue') {
      return {
        status: 'overdue',
        label: 'Overdue',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
        transaction
      };
    }

    return {
      status: 'draft',
      label: 'Draft',
      color: 'bg-purple-100 text-purple-800',
      icon: FileText,
      transaction
    };
  };

  // Calculate statistics
  const stats = {
    totalUnits: propertyUnits.length,
    occupiedUnits: propertyUnits.filter(u => u.status === 'occupied').length,
    invoicesGenerated: transactions.filter(t => 
      t.status !== 'draft' && t.billingPeriodStart.startsWith(selectedMonth)
    ).length,
    paymentsReceived: transactions.filter(t => 
      t.status === 'paid' && t.billingPeriodStart.startsWith(selectedMonth)
    ).length,
    totalExpected: propertyUnits.reduce((sum, u) => sum + (u.monthlyRent || 0), 0),
    totalCollected: transactions
      .filter(t => t.billingPeriodStart.startsWith(selectedMonth))
      .reduce((sum, t) => sum + (t.amountPaid || 0), 0),
    totalPending: transactions
      .filter(t => t.billingPeriodStart.startsWith(selectedMonth) && t.status !== 'paid')
      .reduce((sum, t) => sum + (t.newBalance || 0), 0),
  };

  // Prepare calendar transaction data
  const calendarTransactions = transactions
    .filter(t => t.propertyId === propertyId)
    .map(t => ({
      id: t.id,
      unitId: t.unitId,
      unitNumber: propertyUnits.find(u => u.id === t.unitId)?.unitNumber || 'Unknown',
      amount: t.totalAmount,
      amountPaid: t.amountPaid || 0,
      status: t.status,
      billingPeriodStart: t.billingPeriodStart,
      billingPeriodEnd: t.billingPeriodEnd,
      dueDate: t.billingPeriodEnd
    }));

  const handleCollectRent = (unitId: string) => {
    navigate(`/properties/${propertyId}/units/${unitId}/collect-rent`);
  };

  const handleViewInvoice = (transactionId: string) => {
    navigate(`/rent-transactions/${transactionId}/invoice`);
  };

  const handleRecordPayment = (transactionId: string) => {
    navigate(`/rent-transactions/${transactionId}/record-payment`);
  };

  const handleViewReceipt = (transactionId: string) => {
    navigate(`/rent-transactions/${transactionId}/receipt`);
  };

  const handleCalendarDateSelect = (date: Date) => {
    const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(monthString);
  };

  const handleCalendarTransactionClick = (transaction: any) => {
    // Navigate to the specific unit's rent collection page
    navigate(`/properties/${propertyId}/units/${transaction.unitId}/collect-rent`);
  };

  if (propertyLoading || unitsLoading || transactionsLoading) {
    return (
      <AppLayout title="Rent Collection">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!property) {
    return (
      <AppLayout title="Rent Collection">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Property not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Rent Collection">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/properties/${propertyId}`)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Property
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Rent Collection</h1>
            <p className="mt-2 text-gray-600">{property.name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/properties/${propertyId}/rent-collection/monthly-summary`)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Monthly Summary
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Units</CardTitle>
              <Home className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUnits}</div>
              <p className="text-xs text-gray-600 mt-1">{stats.occupiedUnits} occupied</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Expected</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalExpected)}</div>
              <p className="text-xs text-gray-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Collected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</div>
              <p className="text-xs text-gray-600 mt-1">{stats.paymentsReceived} payments</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalPending)}</div>
              <p className="text-xs text-gray-600 mt-1">{stats.invoicesGenerated - stats.paymentsReceived} invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Rent Collection Calendar */}
        <RentCollectionCalendar
          transactions={calendarTransactions}
          selectedDate={selectedDate}
          onDateSelect={handleCalendarDateSelect}
          onTransactionClick={handleCalendarTransactionClick}
          billingMethod={billingMethod}
          onBillingMethodChange={setBillingMethod}
        />

        {/* Units List */}
        <Card>
          <CardHeader>
            <CardTitle>Units - {formatMonthYear(new Date(selectedMonth + '-01'))}</CardTitle>
            <p className="text-sm text-gray-600">Manage rent collection for all units</p>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Balance Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyUnits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-gray-600">
                        No units found for this property
                      </TableCell>
                    </TableRow>
                  ) : (
                    propertyUnits.map((unit) => {
                      const statusInfo = getUnitTransactionStatus(unit.id);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <TableRow key={unit.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <Home className="h-4 w-4 text-gray-400" />
                              <span>{unit.unitNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={unit.status === 'occupied' ? 'default' : 'secondary'}>
                              {unit.status === 'occupied' ? 'Occupied' : 'Vacant'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(unit.monthlyRent || 0)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="h-4 w-4" />
                              <Badge variant="outline" className={statusInfo.color}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {statusInfo.transaction ? (
                              <span className="font-medium text-green-600">
                                {formatCurrency(statusInfo.transaction.amountPaid || 0)}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {statusInfo.transaction ? (
                              <span className={`font-medium ${statusInfo.transaction.newBalance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                {statusInfo.transaction.newBalance > 0 ? formatCurrency(statusInfo.transaction.newBalance) : '—'}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {statusInfo.status === 'not_started' && unit.status === 'occupied' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleCollectRent(unit.id)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Collect Rent
                                </Button>
                              )}
                              
                              {statusInfo.status === 'draft' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCollectRent(unit.id)}
                                  >
                                    Continue
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleViewInvoice(statusInfo.transaction!.id)}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Generate
                                  </Button>
                                </>
                              )}

                              {(statusInfo.status === 'pending' || statusInfo.status === 'partial' || statusInfo.status === 'overdue') && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewInvoice(statusInfo.transaction!.id)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleRecordPayment(statusInfo.transaction!.id)}
                                  >
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Record Payment
                                  </Button>
                                </>
                              )}

                              {statusInfo.status === 'paid' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewInvoice(statusInfo.transaction!.id)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewReceipt(statusInfo.transaction!.id)}
                                  >
                                    <Receipt className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Collection Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalExpected > 0 
                      ? Math.round((stats.totalCollected / stats.totalExpected) * 100) 
                      : 0}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Rent/Unit</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.occupiedUnits > 0 ? stats.totalExpected / stats.occupiedUnits : 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Invoices</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.invoicesGenerated - stats.paymentsReceived}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
