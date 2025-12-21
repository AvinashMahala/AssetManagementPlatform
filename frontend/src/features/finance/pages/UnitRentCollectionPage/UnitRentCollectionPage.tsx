import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Save, FileText, DollarSign, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { AppLayout } from '@/components/layout';
import { useAuthContext } from '@/contexts';
import { rentTransactionService } from '@/features/finance/services/rentTransactionService';
import { useNotifications } from '@/contexts';
import { useCreateRentTransaction, useDeleteRentTransaction } from '@/features/finance/hooks/useRentTransactions';
import { formatCurrency, getCurrentBillingPeriod } from '@/utils/billingCalculations';

// Hooks
import { useRentCollectionData } from './hooks/useRentCollectionData';
import { useRentCollectionForm } from './hooks/useRentCollectionForm';
import { useRentCollectionCalculations } from './hooks/useRentCollectionCalculations';

// Components
import { RentCollectionHeader } from './components/RentCollectionHeader';
import { RentCollectionInvoiceStatus } from './components/RentCollectionInvoiceStatus';
import { RentCollectionSummary } from './components/RentCollectionSummary';
import { RentCollectionMeterReadings } from './components/RentCollectionMeterReadings';
import { RentCollectionExpenses } from './components/RentCollectionExpenses';
import { RentCollectionTotals } from './components/RentCollectionTotals';
import type { InvoiceGenerationStatus } from './types';

export const UnitRentCollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { showSuccess, showError } = useNotifications();

  // Data Hook
  const {
    propertyId,
    unitId,
    unit,
    property,
    utilities,
    activeLease,
    recentInvoices,
    refetchHistory,
    isLoading,
    lastMeterReadings,
    historyLoading
  } = useRentCollectionData();

  // Form Hook
  const {
    meterReadings,
    expenses,
    newExpense,
    setNewExpense,
    notes,
    setNotes,
    lastSavedAt,
    setLastSavedAt,
    validationSummary,
    handleMeterReadingChange,
    handleAddExpense,
    handleRemoveExpense
  } = useRentCollectionForm({ 
    unitId: unitId!, 
    utilities, 
    lastMeterReadings: lastMeterReadings || undefined, 
    activeLease 
  });

  // Calculations Hook
  const totals = useRentCollectionCalculations({
    unit,
    meterReadings,
    expenses,
    utilities
  });

  // Mutations
  const { mutate: createTransaction, loading: creating } = useCreateRentTransaction();
  const { mutate: deleteTransaction, loading: deleting } = useDeleteRentTransaction();

  // Local State for Actions
  const [saving, setSaving] = useState(false);
  const [invoiceGenerationStatus, setInvoiceGenerationStatus] = useState<InvoiceGenerationStatus>({ 
    step: 'idle', message: '', currentStep: 0, totalSteps: 4 
  });
  const [generatedTransactionId, setGeneratedTransactionId] = useState<string | null>(null);

  const billingPeriod = getCurrentBillingPeriod();

  // Refetch data when component mounts or when navigating back from payment recording
  useEffect(() => {
    const state = location.state as any;
    if (state?.refetchTransactions) {
      refetchHistory();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, refetchHistory, navigate, location.pathname]);

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTransaction(invoiceId);
      refetchHistory();
      showSuccess('Invoice deleted successfully');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      showError('Failed to delete invoice. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    if (!unit || !activeLease || !user) {
      showError('Missing required data: unit, lease, or user');
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
        totalUtilityCharges: totals.totalUtilityCharges,
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
      showSuccess('Draft saved successfully!');
      setLastSavedAt(new Date());
      
      // Save to localStorage
      const autoSaveKey = `rent-collection-draft-${unitId}`;
      const draftData = {
        meterReadings,
        expenses,
        notes,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(autoSaveKey, JSON.stringify(draftData));
      
      navigate(`/properties/${propertyId}/rent-collection`);
    } catch (error) {
      console.error('Failed to save draft:', error);
      showError('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewInvoice = async () => {
    if (!unit || !activeLease || !property || !validationSummary.overall.valid) {
      return;
    }
    // TODO: Implement preview modal
    alert("Preview feature is being refactored. Please generate invoice directly.");
  };

  const handleGenerateInvoice = async () => {
    if (!unit || !activeLease || !property || !user) {
      showError('Missing required data: unit, lease, property, or user');
      return;
    }

    setSaving(true);
    setInvoiceGenerationStatus({ step: 'creating', message: 'Step 1 of 4: Creating transaction...', currentStep: 1, totalSteps: 4 });
    
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
        totalUtilityCharges: totals.totalUtilityCharges,
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
      const response = await createTransaction(transactionData);
      
      if (!response.success || !response.data) {
        const errorMsg = typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Failed to create transaction';
        throw new Error(errorMsg);
      }

      const transaction = response.data;
      setGeneratedTransactionId(transaction.id);

      // Step 2: Generate the invoice PDF
      setInvoiceGenerationStatus({ step: 'generating', message: 'Step 2 of 4: Generating invoice PDF...', currentStep: 2, totalSteps: 4 });
      const invoiceResponse = await rentTransactionService.generateInvoice({
        transactionId: transaction.id
      });

      if (!invoiceResponse.success || !invoiceResponse.data) {
        const errorMsg = typeof invoiceResponse.error === 'string' 
          ? invoiceResponse.error 
          : invoiceResponse.error?.message || 'Failed to generate invoice PDF';
        throw new Error(errorMsg);
      }

      const { pdfUrl, invoiceNumber } = invoiceResponse.data;

      // Step 3: Download the PDF
      setInvoiceGenerationStatus({ step: 'downloading', message: 'Step 3 of 4: Preparing download...', currentStep: 3, totalSteps: 4 });
      
      const pdfFullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${pdfUrl}`;

      // Open PDF in new tab
      setInvoiceGenerationStatus({ step: 'downloading', message: 'Step 4 of 4: Opening invoice in new tab...', currentStep: 4, totalSteps: 4 });
      window.open(pdfFullUrl, '_blank');

      // Success!
      setInvoiceGenerationStatus({ 
        step: 'complete', 
        message: `Invoice ${invoiceNumber} generated successfully! Check your downloads.`,
        currentStep: 4,
        totalSteps: 4
      });
      
      setTimeout(() => {
        setInvoiceGenerationStatus({ step: 'idle', message: '', currentStep: 0, totalSteps: 4 });
      }, 5000);
      
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      setInvoiceGenerationStatus({ 
        step: 'error', 
        message: 'Failed to generate invoice: ' + (error as Error).message,
        currentStep: 0,
        totalSteps: 4
      });
      setTimeout(() => {
        setInvoiceGenerationStatus({ step: 'idle', message: '', currentStep: 0, totalSteps: 4 });
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
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

  return (
    <AppLayout title="Collect Rent">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <RentCollectionHeader 
          property={property || undefined}
          unit={unit || undefined}
          lastSavedAt={lastSavedAt}
          billingPeriod={billingPeriod}
          propertyId={propertyId!}
        />

        <RentCollectionInvoiceStatus status={invoiceGenerationStatus} />

        <RentCollectionSummary validationSummary={validationSummary} />

        {/* Action Buttons */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Ready to generate invoice for:</p>
                <p className="text-3xl font-bold text-green-700">{formatCurrency(totals.totalAmount)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviewInvoice}
                  disabled={!validationSummary.overall.valid}
                  title={`Preview invoice before generating (Ctrl/Cmd + P)${!validationSummary.overall.valid ? ' - Complete required fields first' : ''}`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saving || creating}
                  title={`Save current data as draft (Ctrl/Cmd + S)${saving || creating ? ' - Operation in progress' : ''}`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  onClick={handleGenerateInvoice}
                  disabled={saving || creating || invoiceGenerationStatus.step !== 'idle'}
                  className="bg-green-600 hover:bg-green-700"
                  title={`Generate final invoice (Ctrl/Cmd + G)${invoiceGenerationStatus.step !== 'idle' ? ' - Generation in progress' : !validationSummary.overall.valid ? ' - Complete required fields first' : ''}`}
                >
                  {invoiceGenerationStatus.step !== 'idle' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {invoiceGenerationStatus.step === 'creating' && 'Creating...'}
                      {invoiceGenerationStatus.step === 'generating' && 'Generating...'}
                      {invoiceGenerationStatus.step === 'downloading' && 'Downloading...'}
                      {invoiceGenerationStatus.step === 'complete' && 'Complete!'}
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Invoice
                    </>
                  )}
                </Button>
                {invoiceGenerationStatus.step === 'complete' && generatedTransactionId && (
                  <Button
                    onClick={() => navigate(`/rent-transactions/${generatedTransactionId}/record-payment`)}
                    className="bg-blue-600 hover:bg-blue-700"
                    title="Record a payment for this invoice"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!activeLease && (
          <Card className="border-yellow-500 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800">
                ⚠️ No active lease found for this unit. Please create a lease before generating an invoice.
              </p>
            </CardContent>
          </Card>
        )}

        <RentCollectionTotals totals={totals} utilities={utilities} />

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Invoices</span>
              <Badge variant="outline">{recentInvoices.length} invoice(s)</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : recentInvoices.length > 0 ? (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {invoice.invoiceNumber || `Invoice ${invoice.id.slice(-8)}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(invoice.billingPeriodStart).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric'
                            })} - {formatCurrency(invoice.totalAmount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {invoice.status === 'paid' ? 'Paid' : 
                             invoice.status === 'finalized' ? 'Partially Paid' : 
                             invoice.status === 'draft' ? 'Draft' : 
                             invoice.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/rent-transactions/${invoice.id}/record-payment`, { state: { fromUnitPage: true } })}
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        title="Record a payment for this invoice"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Pay
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // View/Edit invoice
                          navigate(`/properties/${propertyId}/rent-collection/${unitId}/invoice/${invoice.id}`);
                        }}
                        title="View/Edit Invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {invoice.invoiceNumber && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await rentTransactionService.generateInvoice({
                                transactionId: invoice.id
                              });
                              if (response.success && response.data?.pdfUrl) {
                                const pdfFullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${response.data.pdfUrl}`;
                                window.open(pdfFullUrl, '_blank');
                              }
                            } catch (error) {
                              console.error('Failed to download invoice:', error);
                            }
                          }}
                          title="Download Invoice"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        disabled={deleting}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Invoice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No recent invoices found</p>
            )}
          </CardContent>
        </Card>

        <RentCollectionMeterReadings 
          meterReadings={meterReadings}
          onMeterReadingChange={handleMeterReadingChange}
        />

        <RentCollectionExpenses 
          expenses={expenses}
          newExpense={newExpense}
          setNewExpense={setNewExpense}
          onAddExpense={handleAddExpense}
          onRemoveExpense={handleRemoveExpense}
          notes={notes}
          setNotes={setNotes}
        />
      </div>
    </AppLayout>
  );
};
