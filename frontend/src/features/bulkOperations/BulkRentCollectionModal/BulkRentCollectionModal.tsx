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
import { Checkbox } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Alert, AlertDescription } from '@/componentDesignLibrary';
import {
  Calendar,
  Home,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Building2,
} from 'lucide-react';
import { bulkOperationsService } from '../../../services';
import { useNotifications } from '../../../contexts';
import type { BulkRentCollectionInput, BulkOperationResult } from '../../../types/bulkOperations';
import { propertyService } from '../../../services';
import unitService from '../../../services/unitService';

interface Unit {
  id: string;
  unitNumber: string;
  propertyId: string;
  propertyName?: string;
  rentAmount?: number;
  status: string;
}

import type { Property } from '../../../types/property';

interface BulkRentCollectionModalProps {
  onClose: () => void;
  open?: boolean;
}

export const BulkRentCollectionModal: React.FC<BulkRentCollectionModalProps> = ({ onClose, open }) => {
  const [step, setStep] = useState<'select' | 'configure' | 'confirm' | 'processing' | 'result'>('select');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<BulkOperationResult | null>(null);

  // Form data
  const [billingPeriodStart, setBillingPeriodStart] = useState('');
  const [billingPeriodEnd, setBillingPeriodEnd] = useState('');
  const [applyExpenses, setApplyExpenses] = useState(false);
  const [skipExisting, setSkipExisting] = useState(true);

  const { addNotification } = useNotifications();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load properties and units
      const [propertiesResponse, unitsResponse] = await Promise.all([
        propertyService.getAll(),
        unitService.getAll(),
      ]);

      if (propertiesResponse.success && propertiesResponse.data && unitsResponse.success && unitsResponse.data) {
        // Enrich units with property names
        const enrichedUnits = unitsResponse.data.map((unit: any) => {
          const property = propertiesResponse.data!.find((p: any) => p.id === unit.propertyId);
          return {
            ...unit,
            propertyName: property?.name || 'Unknown Property',
          };
        });

        setProperties(propertiesResponse.data);
        setUnits(enrichedUnits);
      } else {
        throw new Error('Failed to load properties and units');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load properties and units',
      });
    }
  };

  const handleUnitToggle = (unitId: string) => {
    setSelectedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handlePropertyToggle = (propertyId: string, checked: boolean) => {
    const propertyUnits = units.filter(unit => unit.propertyId === propertyId);
    const propertyUnitIds = propertyUnits.map(unit => unit.id);

    if (checked) {
      setSelectedUnits(prev => [...new Set([...prev, ...propertyUnitIds])]);
    } else {
      setSelectedUnits(prev => prev.filter(id => !propertyUnitIds.includes(id)));
    }
  };

  const isPropertyFullySelected = (propertyId: string) => {
    const propertyUnits = units.filter(unit => unit.propertyId === propertyId);
    return propertyUnits.length > 0 && propertyUnits.every(unit => selectedUnits.includes(unit.id));
  };

  const handleNext = () => {
    if (step === 'select' && selectedUnits.length > 0) {
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
    if (!billingPeriodStart || !billingPeriodEnd) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select billing period dates',
      });
      return;
    }

    setStep('processing');
    setProcessing(true);

    try {
      const input: BulkRentCollectionInput = {
        unitIds: selectedUnits,
        billingPeriodStart: new Date(billingPeriodStart),
        billingPeriodEnd: new Date(billingPeriodEnd),
        applyExpenses,
        skipUnitsWithExistingTransactions: skipExisting,
      };

      const result = await bulkOperationsService.bulkRentCollection(input);
      setResult(result);

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Bulk Rent Collection Completed',
          message: `Successfully processed ${result.processed} units, ${result.failed} failed`,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Bulk Rent Collection Failed',
          message: result.errors.join(', '),
        });
      }
    } catch (error) {
      console.error('Bulk rent collection error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to perform bulk rent collection',
      });
      setResult({
        success: false,
        processed: 0,
        failed: selectedUnits.length,
        errors: ['Operation failed'],
      });
    } finally {
      setProcessing(false);
      setStep('result');
    }
  };

  const resetModal = () => {
    setStep('select');
    setSelectedUnits([]);
    setResult(null);
    setBillingPeriodStart('');
    setBillingPeriodEnd('');
    setApplyExpenses(false);
    setSkipExisting(true);
  };

  const renderUnitSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Select Units for Rent Collection</h3>
        <Badge variant="secondary">
          {selectedUnits.length} selected
        </Badge>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-4">
        {properties.map((property) => {
          const propertyUnits = units.filter(unit => unit.propertyId === property.id);
          if (propertyUnits.length === 0) return null;

          const fullySelected = isPropertyFullySelected(property.id);

          return (
            <Card key={property.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={fullySelected}
                    onCheckedChange={(checked) => handlePropertyToggle(property.id, checked as boolean)}
                  />
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <div>
                    <CardTitle className="text-base">{property.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {property.address.street}, {property.address.city}, {property.address.state} {property.address.pincode}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {propertyUnits.length} units
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {propertyUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                        selectedUnits.includes(unit.id)
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handleUnitToggle(unit.id)}
                    >
                      <Checkbox
                        checked={selectedUnits.includes(unit.id)}
                        onChange={() => {}} // Controlled by parent click
                      />
                      <Home className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{unit.unitNumber}</div>
                        {unit.rentAmount && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            ${unit.rentAmount}/month
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Configure Rent Collection</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Billing Period Start</Label>
          <Input
            id="start-date"
            type="date"
            value={billingPeriodStart}
            onChange={(e) => setBillingPeriodStart(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">Billing Period End</Label>
          <Input
            id="end-date"
            type="date"
            value={billingPeriodEnd}
            onChange={(e) => setBillingPeriodEnd(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="apply-expenses"
            checked={applyExpenses}
            onCheckedChange={(checked) => setApplyExpenses(checked as boolean)}
          />
          <Label htmlFor="apply-expenses">Apply expenses to rent amounts</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="skip-existing"
            checked={skipExisting}
            onCheckedChange={(checked) => setSkipExisting(checked as boolean)}
          />
          <Label htmlFor="skip-existing">Skip units with existing transactions for this period</Label>
        </div>
      </div>

      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          This will generate rent transactions for {selectedUnits.length} selected units for the billing period from{' '}
          {billingPeriodStart || 'start date'} to {billingPeriodEnd || 'end date'}.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Confirm Bulk Rent Collection</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Units Selected</span>
          </div>
          <Badge variant="secondary">{selectedUnits.length}</Badge>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <span className="font-medium">Billing Period</span>
          </div>
          <span className="text-sm">
            {billingPeriodStart} to {billingPeriodEnd}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Options</span>
          </div>
          <div className="flex space-x-2">
            {applyExpenses && <Badge variant="outline">Apply Expenses</Badge>}
            {skipExisting && <Badge variant="outline">Skip Existing</Badge>}
          </div>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This action cannot be undone. Please verify all settings before proceeding.
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
        <h3 className="text-lg font-medium">Processing Bulk Rent Collection</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generating rent transactions for {selectedUnits.length} units...
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
          {result?.success ? 'Bulk Rent Collection Completed' : 'Bulk Rent Collection Failed'}
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
        return renderUnitSelection();
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
        return 'Select Units';
      case 'configure':
        return 'Configure Collection';
      case 'confirm':
        return 'Confirm Operation';
      case 'processing':
        return 'Processing';
      case 'result':
        return 'Results';
      default:
        return 'Bulk Rent Collection';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'select':
        return selectedUnits.length > 0;
      case 'configure':
        return billingPeriodStart && billingPeriodEnd;
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
            <DollarSign className="h-5 w-5" />
            <span>{getStepTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            Generate rent transactions for multiple units simultaneously
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
                  Start Collection
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