import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Plus, X, Zap, Droplet, Flame, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AppLayout } from '../../components/layout';
import { useUnit, useProperty, useLastMeterReadings, useCreateRentTransaction, useLeases, useUnitTransactionHistory, useDeleteRentTransaction } from '../../hooks';
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
  const { loading: readingsLoading } = useLastMeterReadings(unitId!);
  const { leases } = useLeases(unitId);
  const { history: recentInvoices, loading: historyLoading, refetch: refetchHistory } = useUnitTransactionHistory(unitId!, 5);
  const { mutate: createTransaction, loading: creating } = useCreateRentTransaction();
  const { mutate: deleteTransaction, loading: deleting } = useDeleteRentTransaction();

  const [meterReadings, setMeterReadings] = useState<MeterReadingInput[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpense, setNewExpense] = useState({ category: '', description: '', amount: 0 });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [validationSummary, setValidationSummary] = useState<{
    lease: { valid: boolean; message: string };
    meterReadings: { valid: boolean; message: string };
    expenses: { valid: boolean; message: string };
    overall: { valid: boolean; message: string };
  }>({
    lease: { valid: false, message: 'Checking lease...' },
    meterReadings: { valid: false, message: 'Checking meter readings...' },
    expenses: { valid: true, message: 'No additional expenses' },
    overall: { valid: false, message: 'Validating data...' }
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [editablePreviewData, setEditablePreviewData] = useState<any>(null);
  const [invoiceGenerationStatus, setInvoiceGenerationStatus] = useState<{
    step: 'idle' | 'creating' | 'generating' | 'downloading' | 'complete' | 'error';
    message: string;
    currentStep: number;
    totalSteps: number;
  }>({ step: 'idle', message: '', currentStep: 0, totalSteps: 4 });

  const billingPeriod = getCurrentBillingPeriod();

  // Get active lease for the unit
  const activeLease = useMemo(() => leases.find(lease => 
    lease.status === 'active' && 
    lease.unitId === unitId
  ), [leases, unitId]);

  // Validation summary
  useEffect(() => {
    const leaseValid = !!activeLease;
    const leaseMessage = leaseValid ? 'Active lease found' : 'No active lease found';

    const meterReadingsValid = meterReadings.length === 0 || meterReadings.every(r => {
      const validation = validateMeterReading(r.previousReading, r.currentReading);
      return validation.valid;
    });
    const meterReadingsMessage = meterReadings.length === 0 
      ? 'No meter readings required' 
      : meterReadingsValid 
        ? `All ${meterReadings.length} meter reading(s) valid` 
        : 'Some meter readings have errors';

    const expensesValid = expenses.length === 0 || expenses.every(e => e.category && e.description && e.amount > 0);
    const expensesMessage = expenses.length === 0 
      ? 'No additional expenses' 
      : expensesValid 
        ? `${expenses.length} expense(s) added` 
        : 'Some expenses are incomplete';

    const overallValid = leaseValid && meterReadingsValid && expensesValid;
    const overallMessage = overallValid ? 'All data complete' : 'Some issues need to be resolved';

    setValidationSummary({
      lease: { valid: leaseValid, message: leaseMessage },
      meterReadings: { valid: meterReadingsValid, message: meterReadingsMessage },
      expenses: { valid: expensesValid, message: expensesMessage },
      overall: { valid: overallValid, message: overallMessage }
    });
  }, [meterReadings, expenses, activeLease]);

  // Calculate totals
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

  const totals = useMemo(calculateTotals, [unit, meterReadings, expenses]);

  // Perform auto-save
  const performAutoSave = useCallback(async () => {
    if (!unit || !activeLease || !user) return;

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
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show alert for auto-save failures to avoid interrupting user
    }
  }, [unit, activeLease, user, billingPeriod, totals, meterReadings, expenses, notes, unitId, createTransaction]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveKey = `rent-collection-draft-${unitId}`;
    
    // Load saved data on mount only
    const savedData = localStorage.getItem(autoSaveKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.meterReadings && meterReadings.length === 0) {
          setMeterReadings(parsed.meterReadings);
        }
        if (parsed.expenses) {
          setExpenses(parsed.expenses);
        }
        if (parsed.notes) {
          setNotes(parsed.notes);
        }
        if (parsed.lastSavedAt) {
          setLastSavedAt(new Date(parsed.lastSavedAt));
        }
      } catch (error) {
        console.error('Failed to load saved draft:', error);
      }
    }
  }, [unitId]); // Only run on mount and when unitId changes

  // Auto-save interval - separate effect
  useEffect(() => {
    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(async () => {
      if (unit && activeLease && user && (meterReadings.length > 0 || expenses.length > 0 || notes)) {
        try {
          await performAutoSave();
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [unit, activeLease, user, meterReadings, expenses, notes, performAutoSave]);

  // Save before browser close
  useEffect(() => {
    const autoSaveKey = `rent-collection-draft-${unitId}`;
    
    const handleBeforeUnload = () => {
      const draftData = {
        meterReadings,
        expenses,
        notes,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(autoSaveKey, JSON.stringify(draftData));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unitId, meterReadings, expenses, notes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save draft
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (!saving && !creating) {
          handleSaveDraft();
        }
      }
      
      // Ctrl/Cmd + G to generate invoice
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        if (!saving && !creating && invoiceGenerationStatus.step === 'idle' && validationSummary.overall.valid) {
          handleGenerateInvoice();
        }
      }
      
      // Ctrl/Cmd + P to preview invoice
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        if (!generatingPreview && validationSummary.overall.valid) {
          handlePreviewInvoice();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving, creating, invoiceGenerationStatus.step, validationSummary.overall.valid, generatingPreview]);

  // Invoice Preview Component
  const InvoicePreview: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return null;

    return (
      <div 
        className="invoice-preview-container"
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: "#1a202c",
          background: "white",
          maxWidth: "210mm",
          margin: "0 auto",
          padding: "12mm 10mm",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        {/* Top Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "15px 20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px 12px 0 0",
          color: "white",
          marginBottom: "3px",
        }}>
          <div style={{width: "60px", height: "60px", background: "rgba(255, 255, 255, 0.2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", border: "2px solid rgba(255, 255, 255, 0.3)"}}>🏠</div>
          <div style={{flex: 1, paddingLeft: "15px"}}>
            <div style={{fontSize: "18px", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px"}}>{data.propertyName}</div>
            <div style={{fontSize: "10px", opacity: 0.95, lineHeight: "1.5"}}>
              📍 {data.propertyAddress}<br/>
              📞 {data.propertyPhone || 'N/A'} | 📧 {data.propertyEmail || 'N/A'}
            </div>
          </div>
          <div style={{width: "50px", height: "50px", background: "rgba(255, 255, 255, 0.2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px"}}>🏢</div>
        </div>

        {/* Receipt Banner */}
        <div style={{
          background: "linear-gradient(to right, #f7fafc, #edf2f7)",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "3px solid #667eea",
          marginBottom: "15px",
        }}>
          <div style={{fontSize: "16px", fontWeight: 700, color: "#2d3748", textTransform: "uppercase", letterSpacing: "1px"}}>INVOICE PREVIEW</div>
          <div style={{fontSize: "11px", color: "#4a5568", fontWeight: 600}}>{data.invoiceDate}</div>
        </div>

        {/* Bill Info Bar */}
        <div style={{
          display: "flex",
          gap: "20px",
          padding: "10px 20px",
          background: "#f7fafc",
          borderRadius: "6px",
          marginBottom: "15px",
          fontSize: "10px",
        }}>
          <div style={{flex: 1}}>
            <div style={{color: "#718096", fontWeight: 600, marginBottom: "2px"}}>Bill No</div>
            <div style={{color: "#2d3748", fontWeight: 700, fontSize: "11px"}}>{data.invoiceNumber}</div>
          </div>
          <div style={{flex: 1}}>
            <div style={{color: "#718096", fontWeight: 600, marginBottom: "2px"}}>Period</div>
            <div style={{color: "#2d3748", fontWeight: 700, fontSize: "11px"}}>{data.billingPeriod}</div>
          </div>
        </div>

        {/* Tenant & Room Info Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "15px",
        }}>
          <div style={{
            background: "white",
            border: "1.5px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px",
          }}>
            <div style={{fontSize: "9px", color: "#718096", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px"}}>Room</div>
            <div style={{fontSize: "13px", fontWeight: 700, color: "#2d3748", marginBottom: "4px"}}>Property Unit</div>
            <div style={{fontSize: "10px", color: "#4a5568", lineHeight: "1.6"}}>
              {data.propertyName} - Unit {data.propertyUnit}
            </div>
          </div>
          <div style={{
            background: "white",
            border: "1.5px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px",
          }}>
            <div style={{fontSize: "9px", color: "#718096", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px"}}>Tenant</div>
            <div style={{fontSize: "13px", fontWeight: 700, color: "#2d3748", marginBottom: "4px"}}>{data.tenantName}</div>
            <div style={{fontSize: "10px", color: "#4a5568", lineHeight: "1.6"}}>
              📱 {data.tenantPhone || 'N/A'}<br/>
              📧 {data.tenantEmail || 'N/A'}
            </div>
          </div>
        </div>

        {/* Payment Details Table */}
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "15px",
          fontSize: "10px",
        }}>
          <thead>
            <tr>
              <th style={{background: "#2d3748", color: "white", padding: "8px", textAlign: "center", fontWeight: 600, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3px"}}>Description</th>
              <th style={{background: "#2d3748", color: "white", padding: "8px", textAlign: "center", fontWeight: 600, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3px"}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{padding: "8px", textAlign: "center", borderBottom: "1px solid #e2e8f0"}}>Rent ({data.billingPeriod})</td>
              <td style={{padding: "8px", textAlign: "center", borderBottom: "1px solid #e2e8f0", fontWeight: 700, color: "#2d3748"}}>{data.baseRent}</td>
            </tr>
            {data.maintenanceCharges && parseFloat(data.maintenanceCharges.replace(/[^0-9.-]+/g,"")) > 0 && (
              <tr>
                <td style={{padding: "8px", textAlign: "center", borderBottom: "1px solid #e2e8f0"}}>Maintenance Charges</td>
                <td style={{padding: "8px", textAlign: "center", borderBottom: "1px solid #e2e8f0", fontWeight: 700, color: "#2d3748"}}>{data.maintenanceCharges}</td>
              </tr>
            )}
            {data.meterCharges && parseFloat(data.meterCharges.replace(/[^0-9.-]+/g,"")) > 0 && (
              <tr>
                <td style={{padding: "8px", textAlign: "center", borderBottom: "1px solid #e2e8f0"}}>Electricity Charges</td>
                <td style={{padding: "8px", textAlign: "center", borderBottom: "1px solid #e2e8f0", fontWeight: 700, color: "#2d3748"}}>{data.meterCharges}</td>
              </tr>
            )}
            {data.expenses && parseFloat(data.expenses.replace(/[^0-9.-]+/g,"")) > 0 && (
              <tr>
                <td style={{padding: "8px", textAlign: "center", borderBottom: "1px solid #e2e8f0"}}>Additional Expenses</td>
                <td style={{padding: "8px", textAlign: "center", borderBottom: "1px solid #e2e8f0", fontWeight: 700, color: "#2d3748"}}>{data.expenses}</td>
              </tr>
            )}
            <tr style={{background: "#1a202c", color: "white", fontWeight: 700, fontSize: "11px"}}>
              <td colSpan={1} style={{padding: "8px", textAlign: "center"}}>TOTAL AMOUNT</td>
              <td style={{padding: "8px", textAlign: "center"}}>{data.totalAmount}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
          padding: "10px",
          fontSize: "9px",
          fontWeight: 600,
          borderRadius: "0 0 12px 12px",
          marginTop: "10px",
        }}>
          🙏 Invoice Preview | For actual invoice, click "Generate Invoice"
        </div>
      </div>
    );
  };

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

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTransaction(invoiceId);
      // Refresh the invoice history
      refetchHistory();
      alert('Invoice deleted successfully');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      alert('Failed to delete invoice: ' + (error as Error).message);
    }
  };

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
      alert('Failed to save draft: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewInvoice = async () => {
    if (!unit || !activeLease || !property || !validationSummary.overall.valid) {
      return;
    }

    setGeneratingPreview(true);
    try {
      // Try to fetch tenant data
      let tenantData = { firstName: 'Tenant', lastName: '', phone: '', email: '' };
      try {
        const tenantResponse = await fetch(`/api/tenants/${activeLease.tenantId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (tenantResponse.ok) {
          const tenantResult = await tenantResponse.json();
          if (tenantResult.data) {
            tenantData = tenantResult.data;
          }
        }
      } catch (error) {
        console.warn('Could not fetch tenant data for preview:', error);
      }

      // Build preview data
      const previewData = {
        propertyName: property.name,
        propertyAddress: property.address ? `${property.address.street}, ${property.address.city}, ${property.address.state} - ${property.address.pincode}` : '',
        propertyPhone: '',
        propertyEmail: '',
        invoiceNumber: `PREVIEW-${Date.now()}`,
        invoiceDate: new Date().toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric'
        }),
        billingPeriod: `${new Date(billingPeriod.start).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        })} - ${new Date(billingPeriod.end).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        })}`,
        tenantName: `${tenantData.firstName} ${tenantData.lastName}`.trim() || 'Tenant',
        tenantEmail: tenantData.email || '',
        tenantPhone: tenantData.phone || '',
        landlordName: 'Property Owner',
        landlordEmail: '',
        totalAmount: formatCurrency(totals.totalAmount),
        amountPaid: formatCurrency(0),
        paymentMethod: 'PENDING',
        paymentDate: 'Not Paid',
        termsAndConditions: 'This is a preview. Actual invoice will be generated after confirmation.',
        // Additional data for the detailed template
        propertyUnit: unit.unitNumber,
        baseRent: formatCurrency(totals.baseRent),
        maintenanceCharges: formatCurrency(totals.maintenanceCharges),
        meterCharges: formatCurrency(totals.totalMeterCharges),
        expenses: formatCurrency(totals.totalExpenses),
        previousBalance: formatCurrency(totals.previousBalance),
        balanceDue: formatCurrency(totals.totalAmount),
        chargesRows: buildChargesTable(),
        balanceRow: totals.totalAmount > 0 ? `
          <div style="
            background: linear-gradient(135deg, #fab1a0 0%, #ff7675 100%);
            border: 3px solid #e74c3c;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin-bottom: 15px;
          ">
            <div style="font-size: 11px; color: #7f1d1d; font-weight: 700; margin-bottom: 4px;">Balance Due</div>
            <div style="font-size: 24px; font-weight: 700; color: #991b1b;">${formatCurrency(totals.totalAmount)}</div>
          </div>` : ''
      };

      // Store editable data
      setEditablePreviewData(previewData);

      // Generate HTML using the template structure
      // const html = generatePreviewHtml(previewData);
      // setPreviewHtml(html);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setGeneratingPreview(false);
    }
  };

  const buildChargesTable = () => {
    const rows = [];
    
    // Base rent row
    rows.push(`<tr>
      <td>Rent (${billingPeriod.start} to ${billingPeriod.end})</td>
      <td>${formatCurrency(totals.baseRent)}</td>
    </tr>`);
    
    // Maintenance charges
    if (totals.maintenanceCharges > 0) {
      rows.push(`<tr>
        <td>Maintenance Charges</td>
        <td>${formatCurrency(totals.maintenanceCharges)}</td>
      </tr>`);
    }
    
    // Meter charges
    if (totals.totalMeterCharges > 0) {
      rows.push(`<tr>
        <td>Electricity Charges</td>
        <td>${formatCurrency(totals.totalMeterCharges)}</td>
      </tr>`);
    }
    
    // Previous balance
    if (totals.previousBalance !== 0) {
      rows.push(`<tr>
        <td>Previous Balance</td>
        <td>${formatCurrency(totals.previousBalance)}</td>
      </tr>`);
    }
    
    // Expenses
    if (expenses.length > 0) {
      expenses.forEach(expense => {
        rows.push(`<tr>
          <td>${expense.description} (${expense.category})</td>
          <td>${formatCurrency(expense.amount)}</td>
        </tr>`);
      });
    }
    
    return rows.join('');
  };

  const handleGenerateInvoice = async () => {
    if (!unit || !activeLease || !property || !user) {
      alert('Missing required data: unit, lease, property, or user');
      return;
    }

    // Clear validation state before generation
    setValidationSummary({
      lease: { valid: false, message: 'Validating...' },
      meterReadings: { valid: false, message: 'Validating...' },
      expenses: { valid: false, message: 'Validating...' },
      overall: { valid: false, message: 'Generating invoice...' }
    });

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
        setInvoiceGenerationStatus({ 
          step: 'error', 
          message: `Failed to create transaction: ${errorMsg}`,
          currentStep: 1,
          totalSteps: 4
        });
        throw new Error(errorMsg);
      }

      const transaction = response.data;
      console.log('Transaction created successfully:', transaction);

      // Step 2: Generate the invoice PDF
      setInvoiceGenerationStatus({ step: 'generating', message: 'Step 2 of 4: Generating invoice PDF...', currentStep: 2, totalSteps: 4 });
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
        setInvoiceGenerationStatus({ 
          step: 'error', 
          message: `Failed to generate invoice: ${errorMsg}`,
          currentStep: 2,
          totalSteps: 4
        });
        throw new Error(errorMsg);
      }

      const { pdfUrl, invoiceNumber } = invoiceResponse.data;

      // Step 3: Download the PDF with custom filename
      setInvoiceGenerationStatus({ step: 'downloading', message: 'Step 3 of 4: Preparing download...', currentStep: 3, totalSteps: 4 });
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
      setInvoiceGenerationStatus({ step: 'downloading', message: 'Step 4 of 4: Opening invoice in new tab...', currentStep: 4, totalSteps: 4 });
      window.open(pdfFullUrl, '_blank');

      // Also trigger download (using fetch to avoid navigation)
      setInvoiceGenerationStatus({ step: 'downloading', message: 'Step 4 of 4: Downloading invoice...', currentStep: 4, totalSteps: 4 });
      await fetch(pdfFullUrl)
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

      // Success!
      setInvoiceGenerationStatus({ 
        step: 'complete', 
        message: `Invoice ${invoiceNumber} generated successfully! Check your downloads.`,
        currentStep: 4,
        totalSteps: 4
      });
      
      // Reset status after 5 seconds (increased to give user time to read)
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
      // Reset status after 5 seconds
      setTimeout(() => {
        setInvoiceGenerationStatus({ step: 'idle', message: '', currentStep: 0, totalSteps: 4 });
      }, 5000);
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
            {lastSavedAt && (
              <p className="text-xs text-green-600 mt-1">
                💾 Last saved at {lastSavedAt.toLocaleTimeString()}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Billing Period: {billingPeriod.start} to {billingPeriod.end}
            </p>
          </div>
        </div>

        {/* Invoice Generation Status */}
        {invoiceGenerationStatus.step !== 'idle' && (
          <Card className={`border-2 ${
            invoiceGenerationStatus.step === 'error' ? 'border-red-500 bg-red-50' :
            invoiceGenerationStatus.step === 'complete' ? 'border-green-500 bg-green-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {invoiceGenerationStatus.step === 'creating' && (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="font-semibold text-blue-900">Creating Transaction</p>
                      <p className="text-sm text-blue-700">{invoiceGenerationStatus.message}</p>
                      <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(invoiceGenerationStatus.currentStep / invoiceGenerationStatus.totalSteps) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {invoiceGenerationStatus.step === 'generating' && (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <div>
                      <p className="font-semibold text-purple-900">Generating PDF</p>
                      <p className="text-sm text-purple-700">{invoiceGenerationStatus.message}</p>
                      <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(invoiceGenerationStatus.currentStep / invoiceGenerationStatus.totalSteps) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {invoiceGenerationStatus.step === 'downloading' && (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <div>
                      <p className="font-semibold text-indigo-900">Downloading</p>
                      <p className="text-sm text-indigo-700">{invoiceGenerationStatus.message}</p>
                      <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(invoiceGenerationStatus.currentStep / invoiceGenerationStatus.totalSteps) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {invoiceGenerationStatus.step === 'complete' && (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">Success!</p>
                      <p className="text-sm text-green-700">{invoiceGenerationStatus.message}</p>
                      <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {invoiceGenerationStatus.step === 'error' && (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-red-900">Error</p>
                      <p className="text-sm text-red-700">{invoiceGenerationStatus.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Summary */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Validation Summary</span>
              {validationSummary.overall.valid ? (
                <span className="text-green-600 text-lg">✅</span>
              ) : (
                <span className="text-yellow-600 text-lg">⚠️</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {validationSummary.lease.valid ? (
                  <span className="text-green-600 text-lg">✅</span>
                ) : (
                  <span className="text-red-600 text-lg">❌</span>
                )}
                <div>
                  <p className="font-medium text-sm">Lease</p>
                  <p className="text-xs text-gray-600">{validationSummary.lease.message}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {validationSummary.meterReadings.valid ? (
                  <span className="text-green-600 text-lg">✅</span>
                ) : (
                  <span className="text-yellow-600 text-lg">⚠️</span>
                )}
                <div>
                  <p className="font-medium text-sm">Meter Readings</p>
                  <p className="text-xs text-gray-600">{validationSummary.meterReadings.message}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {validationSummary.expenses.valid ? (
                  <span className="text-green-600 text-lg">✅</span>
                ) : (
                  <span className="text-orange-600 text-lg">ℹ️</span>
                )}
                <div>
                  <p className="font-medium text-sm">Expenses</p>
                  <p className="text-xs text-gray-600">{validationSummary.expenses.message}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
              <p className="text-sm font-medium flex items-center gap-2">
                {validationSummary.overall.valid ? (
                  <span className="text-green-600">✅</span>
                ) : (
                  <span className="text-yellow-600">⚠️</span>
                )}
                {validationSummary.overall.message}
              </p>
            </div>
          </CardContent>
        </Card>

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
                  disabled={generatingPreview || !validationSummary.overall.valid}
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        {!activeLease && (
          <Card className="border-yellow-500 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800">
                ⚠️ No active lease found for this unit. Please create a lease before generating an invoice.
              </p>
            </CardContent>
          </Card>
        )}

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
                             invoice.status === 'partial' ? 'Partially Paid' : 
                             invoice.status === 'draft' ? 'Draft' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
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

        {/* Invoice Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">Invoice Preview & Edit</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">Edit details on the left, preview updates instantly on the right</p>
            </DialogHeader>
            <div className="flex flex-col lg:flex-row gap-6 h-[70vh]">
              {/* Edit Panel */}
              <div className="w-full lg:w-96 bg-white rounded-lg shadow-sm p-5 overflow-y-auto border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">Edit Invoice Details</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Property Name</label>
                    <Input
                      value={editablePreviewData?.propertyName || ''}
                      onChange={(e) => {
                        const updated = { ...editablePreviewData, propertyName: e.target.value };
                        setEditablePreviewData(updated);
                      }}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter property name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Property Address</label>
                    <Input
                      value={editablePreviewData?.propertyAddress || ''}
                      onChange={(e) => {
                        const updated = { ...editablePreviewData, propertyAddress: e.target.value };
                        setEditablePreviewData(updated);
                      }}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter property address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tenant Name</label>
                    <Input
                      value={editablePreviewData?.tenantName || ''}
                      onChange={(e) => {
                        const updated = { ...editablePreviewData, tenantName: e.target.value };
                        setEditablePreviewData(updated);
                      }}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter tenant name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Date</label>
                    <Input
                      type="date"
                      value={editablePreviewData?.invoiceDate || ''}
                      onChange={(e) => {
                        const updated = { ...editablePreviewData, invoiceDate: e.target.value };
                        setEditablePreviewData(updated);
                      }}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</label>
                    <textarea
                      value={editablePreviewData?.termsAndConditions || ''}
                      onChange={(e) => {
                        const updated = { ...editablePreviewData, termsAndConditions: e.target.value };
                        setEditablePreviewData(updated);
                      }}
                      className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter terms and conditions"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview Panel */}
              <div className="flex-1 bg-white rounded-lg shadow-sm p-5 overflow-y-auto border border-gray-200">
                {generatingPreview ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-600">Generating preview...</p>
                    </div>
                  </div>
                ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Live Preview
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Your changes appear instantly here
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowPreviewModal(false);
                            handleGenerateInvoice();
                          }}
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Invoice
                        </Button>
                      </div>
                      <div 
                        className="rounded-lg overflow-auto max-h-[550px] bg-gray-50 p-4"
                      >
                        <InvoicePreview data={editablePreviewData} />
                      </div>
                    </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};
