import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  Home,
  Zap,
  Droplet,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AppLayout } from '../../components/layout';
import { useProperty, useUnits, useRentTransactions, useTenants } from '../../hooks';
import { formatCurrency } from '../../utils/formatters';

export const MonthlySummaryDashboard: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();

  const { data: property, loading: propertyLoading } = useProperty(propertyId!);
  const { units, loading: unitsLoading } = useUnits();
  const { transactions, loading: transactionsLoading } = useRentTransactions(propertyId);
  const { tenants, loading: tenantsLoading } = useTenants();

  // Helper function to format currency using property's currency
  const formatPropertyCurrency = (amount: number) => {
    return formatCurrency(amount, property?.currency || 'INR');
  };

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filter data for selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.billingPeriodStart);
      const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const totalCollected = monthTransactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + (t.amountPaid || 0), 0);

    const totalBalance = monthTransactions
      .filter(t => t.status !== 'paid')
      .reduce((sum, t) => sum + (t.newBalance || 0), 0);

    const totalExpected = monthTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

    const activeTenants = tenants.filter(t => t.status === 'active').length;

    const propertyUnits = units.filter(u => u.propertyId === propertyId);
    const occupiedUnits = propertyUnits.filter(u => u.status === 'occupied').length;

    // Calculate expenses breakdown
    const totalExpenses = monthTransactions.reduce((sum, t) => {
      const expenses = t.expenses || [];
      return sum + expenses.filter(e => e.isRemoved !== true).reduce((expSum, e) => expSum + e.amount, 0);
    }, 0);

    const totalMeterCharges = monthTransactions.reduce((sum, t) => sum + (t.totalMeterCharges || 0), 0);
    const totalUtilityCharges = 0; // TODO: Calculate from meter readings if needed

    return {
      totalCollected,
      totalBalance,
      totalExpected,
      activeTenants,
      occupiedUnits,
      totalUnits: propertyUnits.length,
      totalExpenses,
      totalMeterCharges,
      totalUtilityCharges,
      collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0
    };
  }, [monthTransactions, tenants, units, propertyId]);

  // Generate time-series data for charts (last 6 months)
  const timeSeriesData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const monthTxns = transactions.filter(t => {
        const txnDate = new Date(t.billingPeriodStart);
        const txnMonth = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, '0')}`;
        return txnMonth === monthKey;
      });

      const collected = monthTxns
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + (t.amountPaid || 0), 0);

      const balance = monthTxns
        .filter(t => t.status !== 'paid')
        .reduce((sum, t) => sum + (t.newBalance || 0), 0);

      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        collected,
        balance,
        fullDate: monthKey
      });
    }
    return data;
  }, [transactions]);

  // Pie chart data for income vs expenses
  const incomeExpenseData = useMemo(() => {
    const income = monthlyStats.totalCollected;
    const expenses = monthlyStats.totalExpenses + monthlyStats.totalMeterCharges + monthlyStats.totalUtilityCharges;

    return [
      { name: 'Income', value: income, color: '#10B981' },
      { name: 'Expenses', value: expenses, color: '#EF4444' }
    ];
  }, [monthlyStats]);

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedMonth + '-01');
    const newDate = direction === 'next'
      ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  // Export functions
  const handleGeneratePDF = async () => {
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    let content = `Monthly Rent Collection Summary - ${monthName}\n`;
    content += '=' .repeat(60) + '\n\n';
    content += `Property: ${property?.name}\n\n`;

    content += 'SUMMARY STATISTICS:\n';
    content += `Total Units: ${monthlyStats.totalUnits}\n`;
    content += `Occupied Units: ${monthlyStats.occupiedUnits}\n`;
    content += `Active Tenants: ${monthlyStats.activeTenants}\n`;
    content += `Expected Rent: ${formatPropertyCurrency(monthlyStats.totalExpected)}\n`;
    content += `Collected: ${formatPropertyCurrency(monthlyStats.totalCollected)}\n`;
    content += `Balance Remaining: ${formatPropertyCurrency(monthlyStats.totalBalance)}\n`;
    content += `Collection Rate: ${monthlyStats.collectionRate.toFixed(1)}%\n`;
    content += `Total Expenses: ${formatPropertyCurrency(monthlyStats.totalExpenses)}\n`;
    content += `Meter Charges: ${formatPropertyCurrency(monthlyStats.totalMeterCharges)}\n\n`;

    content += 'UNIT DETAILS:\n';
    monthTransactions.forEach((transaction) => {
      const unit = units.find(u => u.id === transaction.unitId);
      const tenantName = transaction.tenant ? `${transaction.tenant.firstName} ${transaction.tenant.lastName}` : 'Vacant';
      content += `Unit ${unit?.unitNumber || 'Unknown'} - ${tenantName}:\n`;
      content += `  Expected: ${formatPropertyCurrency(transaction.totalAmount)}\n`;
      content += `  Paid: ${formatPropertyCurrency(transaction.amountPaid || 0)}\n`;
      content += `  Balance: ${formatPropertyCurrency(transaction.newBalance || 0)}\n`;
      content += `  Status: ${transaction.status}\n\n`;
    });

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent-summary-${property?.name.replace(/\s+/g, '-')}-${selectedMonth}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateExcel = async () => {
    let csv = 'Property,Month,Unit,Tenant,Expected Amount,Amount Paid,Balance Due,Status,Expenses,Meter Charges\n';

    monthTransactions.forEach((transaction) => {
      const unit = units.find(u => u.id === transaction.unitId);
      const tenantName = transaction.tenant ? `${transaction.tenant.firstName} ${transaction.tenant.lastName}` : 'Vacant';
      const expenses = transaction.expenses?.filter(e => !e.isRemoved).reduce((sum, e) => sum + e.amount, 0) || 0;

      csv += `"${property?.name}","${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}",`;
      csv += `"${unit?.unitNumber || 'Unknown'}","${tenantName}",`;
      csv += `${transaction.totalAmount},${transaction.amountPaid || 0},${transaction.newBalance || 0},`;
      csv += `"${transaction.status}",${expenses},${transaction.totalMeterCharges || 0}\n`;
    });

    // Create and download the CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent-report-${property?.name.replace(/\s+/g, '-')}-${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Tools functions
  const handleCheckReceipt = async () => {
    // For now, show a simple prompt for bill number validation
    const billNumber = prompt('Enter bill number to validate:');
    if (billNumber) {
      // Check if the bill number exists in transactions
      const foundTransaction = transactions.find(t => t.id === billNumber || t.invoiceNumber === billNumber);
      if (foundTransaction) {
        const unit = units.find(u => u.id === foundTransaction.unitId);
        const tenantName = foundTransaction.tenant ? `${foundTransaction.tenant.firstName} ${foundTransaction.tenant.lastName}` : 'Vacant';
        alert(`✅ Receipt Found!\n\nBill Number: ${billNumber}\nUnit: ${unit?.unitNumber || 'Unknown'}\nTenant: ${tenantName}\nAmount: ${formatPropertyCurrency(foundTransaction.amountPaid || 0)}\nStatus: ${foundTransaction.status}`);
      } else {
        alert(`❌ Receipt Not Found\n\nBill number "${billNumber}" was not found in the system.`);
      }
    }
  };

  const handleExportAllRentDetails = async () => {
    // Export all rent transaction details for the property (not just current month)
    let csv = 'Property,Month,Unit,Tenant,Expected Amount,Amount Paid,Balance Due,Status,Expenses,Meter Charges,Transaction Date\n';

    transactions.forEach((transaction) => {
      const unit = units.find(u => u.id === transaction.unitId);
      const tenantName = transaction.tenant ? `${transaction.tenant.firstName} ${transaction.tenant.lastName}` : 'Vacant';
      const expenses = transaction.expenses?.filter(e => !e.isRemoved).reduce((sum, e) => sum + e.amount, 0) || 0;
      const transactionMonth = new Date(transaction.billingPeriodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      csv += `"${property?.name}","${transactionMonth}",`;
      csv += `"${unit?.unitNumber || 'Unknown'}","${tenantName}",`;
      csv += `${transaction.totalAmount},${transaction.amountPaid || 0},${transaction.newBalance || 0},`;
      csv += `"${transaction.status}",${expenses},${transaction.totalMeterCharges || 0},"${new Date(transaction.createdAt || transaction.billingPeriodStart).toLocaleDateString()}"\n`;
    });

    // Create and download the CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-rent-details-${property?.name.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportTenantRoomDetails = async () => {
    // Export all tenant and room details
    // Since tenants aren't directly associated with units in the data structure,
    // we'll use the most recent transaction for each unit to get tenant info
    let csv = 'Property,Unit Number,Unit Status,Monthly Rent,Tenant Name,Tenant Email,Tenant Phone,Tenant Status,Prefix,Profession,Occupation,Number of People,Move-in Date,Rent Start Date,Lease Type,Lease Start Date,Lease Period,Lease Expiry,Extra Services\n';

    units.forEach((unit) => {
      // Find the most recent transaction for this unit to get tenant info
      const recentTransaction = transactions
        .filter(t => t.unitId === unit.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      const tenantName = recentTransaction?.tenant ? `${recentTransaction.tenant.firstName} ${recentTransaction.tenant.lastName}` : 'Vacant';
      const tenantEmail = recentTransaction?.tenant?.email || '';
      const tenantPhone = recentTransaction?.tenant?.phone || '';

      // Get tenant details from the tenant data (if available)
      const tenantDetails = tenants.find(t => recentTransaction?.tenantId === t.id);

      csv += `"${property?.name}","${unit.unitNumber}","${unit.status}",${unit.monthlyRent || 0},`;
      csv += `"${tenantName}","${tenantEmail}","${tenantPhone}","${recentTransaction?.tenant ? 'Active' : 'Vacant'}",`;
      csv += `"${tenantDetails?.prefix || ''}","${tenantDetails?.profession || ''}","${tenantDetails?.occupation || ''}",`;
      csv += `${tenantDetails?.numberOfPeople || ''},"${tenantDetails?.moveInDate || ''}","${tenantDetails?.rentStartDate || ''}",`;
      csv += `"${tenantDetails?.leaseType || ''}","${tenantDetails?.leaseStartDate || ''}",${tenantDetails?.leasePeriodMonths || ''},"${tenantDetails?.leaseExpiryDate || ''}",`;
      csv += `"${tenantDetails?.extraServices?.join(', ') || ''}"\n`;
    });

    // Create and download the CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant-room-details-${property?.name.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (propertyLoading || unitsLoading || transactionsLoading || tenantsLoading) {
    return (
      <AppLayout title="Monthly Summary">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!property) {
    return (
      <AppLayout title="Monthly Summary">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Property not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Monthly Summary Dashboard">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/properties/${propertyId}/rent-collection`)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rent Collection
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Monthly Summary Dashboard</h1>
            <p className="mt-2 text-gray-600">{property.name}</p>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[140px] text-center">
                {new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Collected</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatPropertyCurrency(monthlyStats.totalCollected)}</div>
              <p className="text-xs text-gray-600 mt-1">
                {monthlyStats.collectionRate.toFixed(1)}% of expected
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Balance Left</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatPropertyCurrency(monthlyStats.totalBalance)}</div>
              <p className="text-xs text-gray-600 mt-1">Pending payments</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Tenants</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyStats.activeTenants}</div>
              <p className="text-xs text-gray-600 mt-1">
                {monthlyStats.occupiedUnits}/{monthlyStats.totalUnits} units occupied
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expected</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPropertyCurrency(monthlyStats.totalExpected)}</div>
              <p className="text-xs text-gray-600 mt-1">For this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Collected Amount Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Total Collected Amount (6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {timeSeriesData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600 cursor-pointer"
                      style={{
                        height: `${Math.max((data.collected / Math.max(...timeSeriesData.map(d => d.collected))) * 200, 20)}px`,
                        minHeight: '20px'
                      }}
                      title={`${data.month}: ${formatPropertyCurrency(data.collected)}`}
                    />
                    <span className="text-xs mt-2 text-gray-600">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Total Balance Left Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Total Balance Left (6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {timeSeriesData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-orange-500 rounded-t transition-all hover:bg-orange-600 cursor-pointer"
                      style={{
                        height: `${Math.max((data.balance / Math.max(...timeSeriesData.map(d => d.balance || 1))) * 200, 20)}px`,
                        minHeight: '20px'
                      }}
                      title={`${data.month}: ${formatPropertyCurrency(data.balance)}`}
                    />
                    <span className="text-xs mt-2 text-gray-600">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pie Chart and Export Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income vs Expenses Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Income vs Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <div className="relative">
                  {/* Simple pie chart representation */}
                  <div className="w-48 h-48 rounded-full border-8 border-green-500 relative">
                    <div
                      className="absolute top-0 left-0 w-48 h-48 rounded-full border-8 border-red-500"
                      style={{
                        clipPath: `polygon(0 0, 50% 0, 50% 50%, 0 50%)`,
                        transform: `rotate(${(incomeExpenseData[0].value / (incomeExpenseData[0].value + incomeExpenseData[1].value)) * 360}deg)`
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatPropertyCurrency(incomeExpenseData[0].value + incomeExpenseData[1].value)}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm">Income: {formatPropertyCurrency(incomeExpenseData[0].value)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm">Expenses: {formatPropertyCurrency(incomeExpenseData[1].value)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <p className="text-sm text-gray-600">Generate reports for all units in {property.name}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGeneratePDF}
                className="w-full flex items-center justify-center space-x-2"
                variant="outline"
              >
                <Receipt className="h-4 w-4" />
                <span>Generate Rent Receipt PDF (All Rooms)</span>
              </Button>

              <Button
                onClick={handleGenerateExcel}
                className="w-full flex items-center justify-center space-x-2"
                variant="outline"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Generate Excel Report (All Rooms)</span>
              </Button>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Reports will include all units for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tools Section */}
          <Card>
            <CardHeader>
              <CardTitle>Tools</CardTitle>
              <p className="text-sm text-gray-600">Convenience features for property management</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCheckReceipt}
                className="w-full flex items-center justify-center space-x-2"
                variant="outline"
              >
                <Receipt className="h-4 w-4" />
                <span>Check Receipt (Bill Validation)</span>
              </Button>

              <Button
                onClick={handleExportAllRentDetails}
                className="w-full flex items-center justify-center space-x-2"
                variant="outline"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>All Rent Details → Excel</span>
              </Button>

              <Button
                onClick={handleExportTenantRoomDetails}
                className="w-full flex items-center justify-center space-x-2"
                variant="outline"
              >
                <Users className="h-4 w-4" />
                <span>All Tenant & Room Details → Export</span>
              </Button>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Additional tools for property management
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="utilities">Utilities</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{monthlyStats.totalUnits}</div>
                    <div className="text-sm text-gray-600">Total Units</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{monthlyStats.occupiedUnits}</div>
                    <div className="text-sm text-gray-600">Occupied Units</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{formatPropertyCurrency(monthlyStats.totalMeterCharges)}</div>
                    <div className="text-sm text-gray-600">Meter Charges</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Receipt className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">{formatPropertyCurrency(monthlyStats.totalExpenses)}</div>
                    <div className="text-sm text-gray-600">Additional Expenses</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthTransactions.map((transaction) => {
                    const unit = units.find(u => u.id === transaction.unitId);
                    const expenses = transaction.expenses || [];

                    return (
                      <div key={transaction.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Unit {unit?.unitNumber || 'Unknown'}</h4>
                          <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                        {expenses.filter(e => !e.isRemoved).length > 0 ? (
                          <div className="space-y-2">
                            {expenses.filter(e => !e.isRemoved).map((expense, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{expense.description} ({expense.category})</span>
                                <span className="font-medium">{formatPropertyCurrency(expense.amount)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No additional expenses</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Utility Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthTransactions.map((transaction) => {
                    const unit = units.find(u => u.id === transaction.unitId);

                    return (
                      <div key={transaction.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Unit {unit?.unitNumber || 'Unknown'}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{formatCurrency(transaction.totalMeterCharges || 0)}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span>Electricity</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Droplet className="h-4 w-4 text-blue-500" />
                            <span>Water</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Flame className="h-4 w-4 text-red-500" />
                            <span>Gas</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};