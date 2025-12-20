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
import { Card, CardContent } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Alert, AlertDescription } from '@/componentDesignLibrary';
import { Checkbox } from '@/componentDesignLibrary';
import { Label } from '@/componentDesignLibrary';
import {
  Receipt,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
} from 'lucide-react';
import { bulkOperationsService } from '../../../services';
import { useNotifications } from '../../../contexts';
import type { BulkReceiptGenerationInput, BulkOperationResult } from '../../../types/bulkOperations';
import rentTransactionService from '../../../services/rentTransactionService';

interface PaidTransaction {
  id: string;
  tenantName?: string;
  unitNumber?: string;
  propertyName?: string;
  totalAmount: number;
  paidAmount: number;
  receiptGenerated: boolean;
  receiptNumber?: string;
  paymentDate: string;
}

interface BulkReceiptGenerationModalProps {
  onClose: () => void;
  open?: boolean;
}

export const BulkReceiptGenerationModal: React.FC<BulkReceiptGenerationModalProps> = ({ onClose, open }) => {
  const [step, setStep] = useState<'select' | 'configure' | 'confirm' | 'processing' | 'result'>('select');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<PaidTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<BulkOperationResult | null>(null);

  // Form data
  const [regenerateExisting, setRegenerateExisting] = useState(false);

  const { addNotification } = useNotifications();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await rentTransactionService.getAll();
      // Filter for paid transactions that may need receipts
      const paidTransactions = (response.data || []).filter((t: any) =>
        t.status === 'paid'
      );

      // Enrich with tenant and unit information
      const enrichedTransactions = paidTransactions.map((transaction: any) => ({
        id: transaction.id,
        tenantName: transaction.tenant?.firstName + ' ' + transaction.tenant?.lastName,
        unitNumber: transaction.unit?.unitNumber,
        propertyName: transaction.property?.name,
        totalAmount: Number(transaction.totalAmount) || 0,
        paidAmount: Number(transaction.paidAmount || transaction.totalAmount) || 0,
        receiptGenerated: transaction.receiptGenerated || false,
        receiptNumber: transaction.receiptNumber,
        paymentDate: transaction.paymentDate || transaction.updatedAt,
      }));

      setTransactions(enrichedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load paid transactions',
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const availableTransactions = transactions.filter(t =>
        regenerateExisting || !t.receiptGenerated
      );
      setSelectedTransactions(availableTransactions.map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
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
    setStep('processing');
    setProcessing(true);

    try {
      const input: BulkReceiptGenerationInput = {
        transactionIds: selectedTransactions,
        regenerateExisting,
      };

      const result = await bulkOperationsService.bulkReceiptGeneration(input);
      setResult(result);

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Bulk Receipt Generation Completed',
          message: `Successfully generated receipts for ${result.processed} transactions`,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Bulk Receipt Generation Failed',
          message: result.errors.join(', '),
        });
      }
    } catch (error) {
      console.error('Bulk receipt generation error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate bulk receipts',
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
    setRegenerateExisting(false);
  };

  const availableTransactions = transactions.filter(t =>
    regenerateExisting || !t.receiptGenerated
  );
  const allSelected = availableTransactions.length > 0 &&
    availableTransactions.every(t => selectedTransactions.includes(t.id));

  const renderTransactionSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Select Transactions for Receipt Generation</h3>
        <Badge variant="secondary">
          {selectedTransactions.length} selected
        </Badge>
      </div>

      <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Checkbox
          id="select-all"
          checked={allSelected}
          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
        />
        <Label htmlFor="select-all" className="text-sm">
          Select all available transactions ({availableTransactions.length})
        </Label>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {transactions.map((transaction) => {
          const isAvailable = regenerateExisting || !transaction.receiptGenerated;

          return (
            <Card
              key={transaction.id}
              className={`transition-colors ${
                !isAvailable
                  ? 'opacity-50 cursor-not-allowed'
                  : selectedTransactions.includes(transaction.id)
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 cursor-pointer'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
              }`}
              onClick={() => isAvailable && handleTransactionToggle(transaction.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedTransactions.includes(transaction.id)}
                      disabled={!isAvailable}
                      onChange={() => {}} // Controlled by card click
                    />
                    <div>
                      <div className="font-medium">
                        {transaction.tenantName} - {transaction.unitNumber}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.propertyName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Paid: ${(transaction.paidAmount || 0).toFixed(2)} on {new Date(transaction.paymentDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {transaction.receiptGenerated ? (
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Receipt #{transaction.receiptNumber}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No Receipt
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {transactions.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No paid transactions found
        </div>
      )}
    </div>
  );

  const renderConfiguration = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Configure Receipt Generation</h3>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="regenerate-existing"
            checked={regenerateExisting}
            onCheckedChange={(checked) => setRegenerateExisting(checked as boolean)}
          />
          <Label htmlFor="regenerate-existing">Regenerate receipts for transactions that already have receipts</Label>
        </div>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          This will generate PDF receipts for {selectedTransactions.length} selected transactions.
          {!regenerateExisting && ' Only transactions without existing receipts will be processed.'}
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Confirm Bulk Receipt Generation</h3>

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
            <Receipt className="h-5 w-5 text-green-500" />
            <span className="font-medium">Regenerate Existing</span>
          </div>
          <Badge variant={regenerateExisting ? "default" : "outline"}>
            {regenerateExisting ? 'Yes' : 'No'}
          </Badge>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This will generate PDF receipts for {selectedTransactions.length} transactions.
          Each receipt will be saved and the transaction records will be updated.
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
        <h3 className="text-lg font-medium">Processing Bulk Receipt Generation</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generating receipts for {selectedTransactions.length} transactions...
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
          {result?.success ? 'Bulk Receipt Generation Completed' : 'Bulk Receipt Generation Failed'}
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
        return 'Configure Generation';
      case 'confirm':
        return 'Confirm Operation';
      case 'processing':
        return 'Processing';
      case 'result':
        return 'Results';
      default:
        return 'Bulk Receipt Generation';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'select':
        return selectedTransactions.length > 0;
      case 'configure':
        return true;
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
            <Receipt className="h-5 w-5" />
            <span>{getStepTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            Generate PDF receipts for multiple paid transactions
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
                  Generate Receipts
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