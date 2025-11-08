import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Plus, X, Zap, Droplet, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { AppLayout } from '../../components/layout';
import { useUnit, useProperty, useLastMeterReadings, useCreateRentTransaction, useLeases } from '../../hooks';
import { useAuthContext } from '../../contexts';
import { rentTransactionService } from '../../services/rentTransactionService';
import type { MeterReadingInput, ExpenseItem } from '../../types/rentTransaction';
import { 
  formatCurrency, 
  getCurrentBillingPeriod, 
  calculateMeterCharge, 
  validateMeterReading 
} from '../../utils/billingCalculations';

export const UnitRentCollectionPage: React.FC = () => {
  const { propertyId, unitId } = useParams<{ propertyId: string; unitId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const { data: unit, loading: unitLoading } = useUnit(unitId!);
  const { data: property } = useProperty(propertyId!);
  const { data: lastReadings, loading: readingsLoading } = useLastMeterReadings(unitId!);
  const { leases, loading: leasesLoading } = useLeases(unitId);
  const { mutate: createTransaction, loading: creating } = useCreateRentTransaction();

  const [meterReadings, setMeterReadings] = useState<MeterReadingInput[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpense, setNewExpense] = useState({ category: '', description: '', amount: 0 });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const billingPeriod = getCurrentBillingPeriod();

  // Get active lease for the unit
  const activeLease = leases.find(lease => 
    lease.status === 'active' && 
    lease.unitId === unitId
  );

  // Initialize meter readings
  useEffect(() => {
    if (lastReadings && lastReadings.length > 0 && meterReadings.length === 0) {
      const initialReadings: MeterReadingInput[] = lastReadings.map((reading: any) => ({
        meterId: reading.meterId,
        meterName: reading.meterName,
        meterType: reading.meterType,
        meterNumber: reading.meterNumber || '',
        previousReading: reading.lastReading,
        currentReading: reading.lastReading,
        unitsConsumed: 0,
        costPerUnit: reading.costPerUnit,
        fixedCharge: reading.fixedCharge || 0,
        totalCost: 0,
        readingDate: new Date().toISOString().split('T')[0],
      }));
      setMeterReadings(initialReadings);
    }
  }, [lastReadings, meterReadings.length]);

  const handleMeterReadingChange = (index: number, value: string) => {
    const updated = [...meterReadings];
    const currentReading = parseFloat(value) || 0;
    const { unitsConsumed, totalCost } = calculateMeterCharge(
      updated[index].previousReading,
      currentReading,
      updated[index].costPerUnit,
      updated[index].fixedCharge
    );

    updated[index] = {
      ...updated[index],
      currentReading,
      unitsConsumed,
      totalCost,
    };

    setMeterReadings(updated);
  };

  const handleAddExpense = () => {
    if (newExpense.category && newExpense.description && newExpense.amount > 0) {
      setExpenses([...expenses, { 
        id: Date.now().toString(),
        ...newExpense,
        isRemoved: false 
      }]);
      setNewExpense({ category: '', description: '', amount: 0 });
    }
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const calculateTotals = () => {
    const baseRent = unit?.monthlyRent || 0;
    const maintenanceCharges = unit?.maintenanceCharges || 0;
    const totalMeterCharges = meterReadings.reduce((sum, r) => sum + r.totalCost, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const previousBalance = 0; // TODO: Get from last transaction
    const totalAmount = baseRent + maintenanceCharges + totalMeterCharges + totalExpenses + previousBalance;

    return {
      baseRent,
      maintenanceCharges,
      totalMeterCharges,
      totalExpenses,
      previousBalance,
      totalAmount,
    };
  };

  const totals = calculateTotals();

  const handleSaveDraft = async () => {
    if (!unit || !activeLease || !user) {
      alert('Missing required data: unit, lease, or user');
      return;
    }

    setSaving(true);
    try {
      const billingDays = Math.ceil(
        (new Date(billingPeriod.end).getTime() - new Date(billingPeriod.start).getTime()) 
        / (1000 * 60 * 60 * 24)
      );

      const transactionData = {
        leaseId: activeLease.id,
        unitId: unit.id,
        propertyId: unit.propertyId,
        tenantId: activeLease.tenantId,
        billingPeriodStart: billingPeriod.start,
        billingPeriodEnd: billingPeriod.end,
        billingMethod: 'relative' as const,
        daysCount: billingDays,
        baseRent: totals.baseRent,
        maintenanceCharges: totals.maintenanceCharges,
        previousBalance: totals.previousBalance,
        meterReadings: meterReadings.map(m => ({
          meterId: m.meterId,
          meterName: m.meterName,
          meterType: m.meterType,
          meterNumber: m.meterNumber || '',
          previousReading: m.previousReading,
          currentReading: m.currentReading,
          unitsConsumed: m.unitsConsumed,
          costPerUnit: m.costPerUnit,
          fixedCharge: m.fixedCharge,
          totalCost: m.totalCost,
          readingDate: new Date().toISOString()
        })),
        expenses: expenses.map(e => ({
          id: e.id,
          category: e.category,
          description: e.description,
          amount: e.amount,
          isRemoved: false
        })),
        totalMeterCharges: totals.totalMeterCharges,
        totalExpenses: totals.totalExpenses,
        totalAmount: totals.totalAmount,
        amountPaid: 0,
        newBalance: totals.totalAmount,
        payments: [],
        status: 'draft' as const,
        receiptGenerated: false,
        notes,
      };

      await createTransaction(transactionData);
      alert('Draft saved successfully!');
      navigate(`/properties/${propertyId}/rent-collection`);
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!unit || !activeLease || !user || !property) {
      alert('Missing required data: unit, lease, property, or user');
      return;
    }

    // Validate meter readings
    const hasInvalidReadings = meterReadings.some(r => {
      const validation = validateMeterReading(r.previousReading, r.currentReading);
      return !validation.valid;
    });

    if (hasInvalidReadings) {
      alert('Please fix invalid meter readings before generating invoice');
      return;
    }

    setSaving(true);
    try {
      const billingDays = Math.ceil(
        (new Date(billingPeriod.end).getTime() - new Date(billingPeriod.start).getTime()) 
        / (1000 * 60 * 60 * 24)
      );

      const transactionData = {
        leaseId: activeLease.id,
        unitId: unit.id,
        propertyId: unit.propertyId,
        tenantId: activeLease.tenantId,
        billingPeriodStart: billingPeriod.start,
        billingPeriodEnd: billingPeriod.end,
        billingMethod: 'relative' as const,
        daysCount: billingDays,
        baseRent: totals.baseRent,
        maintenanceCharges: totals.maintenanceCharges,
        previousBalance: totals.previousBalance,
        meterReadings: meterReadings.map(m => ({
          meterId: m.meterId,
          meterName: m.meterName,
          meterType: m.meterType,
          meterNumber: m.meterNumber || '',
          previousReading: m.previousReading,
          currentReading: m.currentReading,
          unitsConsumed: m.unitsConsumed,
          costPerUnit: m.costPerUnit,
          fixedCharge: m.fixedCharge,
          totalCost: m.totalCost,
          readingDate: new Date().toISOString()
        })),
        expenses: expenses.map(e => ({
          id: e.id,
          category: e.category,
          description: e.description,
          amount: e.amount,
          isRemoved: false
        })),
        totalMeterCharges: totals.totalMeterCharges,
        totalExpenses: totals.totalExpenses,
        totalAmount: totals.totalAmount,
        amountPaid: 0,
        newBalance: totals.totalAmount,
        payments: [],
        status: 'draft' as const,
        receiptGenerated: false,
        notes,
        createdBy: user.id,
      };

      // Step 1: Create the transaction
      console.log('Creating transaction with data:', transactionData);
      const response = await createTransaction(transactionData);
      console.log('Transaction creation response:', response);
      
      if (!response.success || !response.data) {
        const errorMsg = typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Failed to create transaction';
        console.error('Transaction creation failed:', errorMsg);
        alert(`Failed to create transaction: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const transaction = response.data;
      console.log('Transaction created successfully:', transaction);

      // Step 2: Generate the invoice PDF
      console.log('Calling generateInvoice with transaction ID:', transaction.id);
      const invoiceResponse = await rentTransactionService.generateInvoice({
        transactionId: transaction.id
      });
      console.log('Invoice generation response:', invoiceResponse);

      if (!invoiceResponse.success || !invoiceResponse.data) {
        const errorMsg = typeof invoiceResponse.error === 'string' 
          ? invoiceResponse.error 
          : invoiceResponse.error?.message || 'Failed to generate invoice PDF';
        console.error('Invoice generation failed:', errorMsg);
        alert(`Failed to generate invoice: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const { pdfUrl, invoiceNumber } = invoiceResponse.data;

      // Step 3: Download the PDF with custom filename
      const date = new Date(billingPeriod.start);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      // Get tenant name
      const tenant = await fetch(`/api/tenants/${activeLease.tenantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(r => r.json());
      
      const tenantName = tenant.data 
        ? `${tenant.data.firstName}${tenant.data.lastName}`.replace(/\s+/g, '')
        : 'Tenant';
      
      const propertyName = property.name.replace(/\s+/g, '');
      const unitNum = unit.unitNumber.replace(/\s+/g, '');
      
      // Format: RentInvoice_MM_YYYY_TenantNameFull_PropertyName_UnitNum.pdf
      const filename = `RentInvoice_${month}_${year}_${tenantName}_${propertyName}_${unitNum}.pdf`;

      const pdfFullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${pdfUrl}`;

      // Open PDF in new tab
      window.open(pdfFullUrl, '_blank');

      // Also trigger download (using fetch to avoid navigation)
      fetch(pdfFullUrl)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          // Clean up the blob URL
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(err => console.error('Download failed:', err));

      alert(`Invoice generated successfully! (${invoiceNumber})`);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert('Failed to generate invoice: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (unitLoading || readingsLoading) {
    return (
      <AppLayout title="Collect Rent">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!unit) {
    return (
      <AppLayout title="Collect Rent">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Unit not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getMeterIcon = (type: string) => {
    switch (type) {
      case 'electricity': return Zap;
      case 'water': return Droplet;
      case 'gas': return Flame;
      default: return Zap;
    }
  };

  return (
    <AppLayout title="Collect Rent">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
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
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Collect Rent</h1>
            <p className="mt-2 text-gray-600">
              {property?.name} - Unit {unit.unitNumber}
            </p>
            <p className="text-sm text-gray-500">
              Billing Period: {billingPeriod.start} to {billingPeriod.end}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving || creating}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handleGenerateInvoice}
              disabled={saving || creating}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Base Rent</p>
                <p className="text-xl font-bold">{formatCurrency(totals.baseRent)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Utilities</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.totalMeterCharges)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(totals.totalExpenses)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Due</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Base Charges */}
        <Card>
          <CardHeader>
            <CardTitle>Base Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Monthly Rent</span>
              <span className="text-lg font-semibold">{formatCurrency(totals.baseRent)}</span>
            </div>
            {totals.maintenanceCharges > 0 && (
              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-gray-700">Maintenance Charges</span>
                <span className="text-lg font-semibold">{formatCurrency(totals.maintenanceCharges)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meter Readings */}
        {meterReadings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Meter Readings</span>
                <Badge variant="outline">{meterReadings.length} meter(s)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {meterReadings.map((reading, index) => {
                const Icon = getMeterIcon(reading.meterType);
                const validation = validateMeterReading(reading.previousReading, reading.currentReading);

                return (
                  <div key={reading.meterId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        reading.meterType === 'electricity' ? 'bg-yellow-100' :
                        reading.meterType === 'water' ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{reading.meterName}</h4>
                        <p className="text-sm text-gray-600 capitalize">{reading.meterType}</p>
                      </div>
                      <Badge>₹{reading.costPerUnit}/unit</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Previous</label>
                        <Input value={reading.previousReading} disabled className="bg-gray-50" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Current *</label>
                        <Input
                          type="number"
                          value={reading.currentReading}
                          onChange={(e) => handleMeterReadingChange(index, e.target.value)}
                          min={reading.previousReading}
                          step="0.01"
                          className={!validation.valid ? 'border-red-500' : ''}
                        />
                        {!validation.valid && (
                          <p className="text-xs text-red-600 mt-1">{validation.error}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Total Cost</label>
                        <div className="text-lg font-bold text-green-600 py-2">
                          ₹{reading.totalCost.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {reading.unitsConsumed.toFixed(2)} units × ₹{reading.costPerUnit} + ₹{reading.fixedCharge} = ₹{reading.totalCost.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Expense Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Category</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Repairs">Repairs</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Internet">Internet</option>
                <option value="Other">Other</option>
              </select>
              <Input
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Amount"
                value={newExpense.amount || ''}
                onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
              <Button onClick={handleAddExpense} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Expense List */}
            {expenses.length > 0 ? (
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-xs text-gray-600">{expense.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-orange-600">₹{expense.amount.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExpense(expense.id!)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No additional expenses added</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or special instructions..."
              className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
