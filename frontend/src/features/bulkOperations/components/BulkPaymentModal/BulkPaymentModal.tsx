import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Label } from '@/componentDesignLibrary';
import { Card, CardContent } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Alert, AlertDescription } from '@/componentDesignLibrary';
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  DollarSign,
} from 'lucide-react';
import { bulkOperationsService } from '@/features/bulkOperations/services/bulkOperationsService';
import { useNotifications } from '@/contexts';
import type { BulkPaymentInput, BulkOperationResult } from '@/features/bulkOperations/types';
import rentTransactionService from '@/features/finance/services/rentTransactionService';

interface RentTransaction {
  id: string;
  tenantName?: string;
  unitNumber?: string;
  propertyName?: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  dueDate: string;
}

interface BulkPaymentModalProps {
  onClose: () => void;
  open?: boolean;
}

export const BulkPaymentModal: React.FC<BulkPaymentModalProps> = ({ onClose, open }) => {
  const [step, setStep] = useState<'select' | 'configure' | 'confirm' | 'processing' | 'result'>('select');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<RentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<BulkOperationResult | null>(null);

  // Form data
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentReference, setPaymentReference] = useState('');

  const { addNotification } = useNotifications();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await rentTransactionService.getAll();
      // Filter for unpaid or partially paid transactions
      const unpaidTransactions = (response.data || []).filter((t: any) =>
        t.status === 'pending' || t.status === 'overdue' || t.balance > 0
      );

      // Enrich with tenant and unit information
      const enrichedTransactions = unpaidTransactions.map((transaction: any) => ({
        id: transaction.id,
        tenantName: transaction.tenant?.firstName + ' ' + transaction.tenant?.lastName,
        unitNumber: transaction.unit?.unitNumber,
        propertyName: transaction.property?.name,
        totalAmount: Number(transaction.totalAmount) || 0,
        paidAmount: Number(transaction.paidAmount) || 0,
        balance: Number(transaction.balance || transaction.totalAmount) || 0,
        status: transaction.status,
        dueDate: transaction.dueDate,
      }));

      setTransactions(enrichedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load rent transactions',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionToggle = (transactionId: string) => {
    setSelectedTransactions(prev =>
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleNext = () => {
    if (step === 'select' && selectedTransactions.length > 0) {
      setStep('configure');
    } else if (step === 'configure') {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'configure') {
      setStep('select');
    } else if (step === 'confirm') {
      setStep('configure');
    }
  };

  const handleSubmit = async () => {
    if (!paymentAmount || !paymentMethod || !paymentDate) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    setStep('processing');
    setProcessing(true);

    try {
      const input: BulkPaymentInput = {
        transactionIds: selectedTransactions,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        paymentDate: new Date(paymentDate),
        paymentReference: paymentReference || undefined,
      };

      const result = await bulkOperationsService.bulkPaymentRecording(input);
      setResult(result);

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Bulk Payment Recording Completed',
          message: `Successfully recorded payments for ${result.processed} transactions`,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Bulk Payment Recording Failed',
          message: result.errors.join(', '),
        });
      }
    } catch (error) {
      console.error('Bulk payment recording error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to record bulk payments',
      });
      setResult({
        success: false,
        processed: 0,
        failed: selectedTransactions.length,
        errors: ['Operation failed'],
      });
    } finally {
      setProcessing(false);
      setStep('result');
    }
  };

  const resetModal = () => {
    setStep('select');
    setSelectedTransactions([]);
    setResult(null);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentReference('');
  };

  const renderTransactionSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Select Transactions for Payment Recording</h3>
        <Badge variant="secondary">
          {selectedTransactions.length} selected
        </Badge>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {transactions.map((transaction) => (
          <Card
            key={transaction.id}
            className={`cursor-pointer transition-colors ${
              selectedTransactions.includes(transaction.id)
                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => handleTransactionToggle(transaction.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(transaction.id)}
                    onChange={() => {}} // Controlled by card click
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium">
                      {transaction.tenantName} - {transaction.unitNumber}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.propertyName}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">
                    ${(transaction.balance || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Due: {new Date(transaction.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transactions.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No outstanding transactions found
        </div>
      )}
    </div>
  );

  const renderConfiguration = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Configure Payment Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment-amount">Payment Amount *</Label>
          <Input
            id="payment-amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-method">Payment Method *</Label>
          <select
            id="payment-method"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="online">Online Payment</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment-date">Payment Date *</Label>
          <Input
            id="payment-date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-reference">Payment Reference</Label>
          <Input
            id="payment-reference"
            placeholder="Check #, Transaction ID, etc."
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
          />
        </div>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          This payment amount will be applied to each of the {selectedTransactions.length} selected transactions.
          If the amount exceeds the balance, it will be recorded as overpayment.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Confirm Bulk Payment Recording</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Transactions Selected</span>
          </div>
          <Badge variant="secondary">{selectedTransactions.length}</Badge>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span className="font-medium">Payment Amount</span>
          </div>
          <span className="font-medium">${parseFloat(paymentAmount).toFixed(2)} each</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Payment Method</span>
          </div>
          <Badge variant="outline">{paymentMethod.replace('_', ' ')}</Badge>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-orange-500" />
            <span className="font-medium">Payment Date</span>
          </div>
          <span className="text-sm">{new Date(paymentDate).toLocaleDateString()}</span>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This will record a payment of ${parseFloat(paymentAmount).toFixed(2)} for each of the {selectedTransactions.length} selected transactions.
          Total amount to be processed: ${(parseFloat(paymentAmount) * selectedTransactions.length).toFixed(2)}
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderProcessing = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
      <div>
        <h3 className="text-lg font-medium">Processing Bulk Payment Recording</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Recording payments for {selectedTransactions.length} transactions...
        </p>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6">
      <div className="text-center">
        {result?.success ? (
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        ) : (
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        )}
        <h3 className="text-lg font-medium mt-4">
          {result?.success ? 'Bulk Payment Recording Completed' : 'Bulk Payment Recording Failed'}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{result?.processed || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
        </div>
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{result?.failed || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
        </div>
      </div>

      {result?.errors && result.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {result.errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const getStepContent = () => {
    switch (step) {
      case 'select':
        return renderTransactionSelection();
      case 'configure':
        return renderConfiguration();
      case 'confirm':
        return renderConfirmation();
      case 'processing':
        return renderProcessing();
      case 'result':
        return renderResult();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'select':
        return 'Select Transactions';
      case 'configure':
        return 'Configure Payment';
      case 'confirm':
        return 'Confirm Operation';
      case 'processing':
        return 'Processing';
      case 'result':
        return 'Results';
      default:
        return 'Bulk Payment Recording';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'select':
        return selectedTransactions.length > 0;
      case 'configure':
        return paymentAmount && paymentMethod && paymentDate;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>{getStepTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            Record payments for multiple rent transactions simultaneously
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {getStepContent()}
        </div>

        <DialogFooter>
          {step === 'result' ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetModal}>
                Start New Operation
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {step !== 'select' && step !== 'processing' && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              {step === 'confirm' && (
                <Button onClick={handleSubmit} disabled={processing}>
                  {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Record Payments
                </Button>
              )}
              {step !== 'confirm' && step !== 'processing' && (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Next
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};