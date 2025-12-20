import React, { useState } from 'react';
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
import { Badge } from '@/componentDesignLibrary';
import { Alert, AlertDescription } from '@/componentDesignLibrary';
import {
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { bulkOperationsService } from '../../../services';
import { useNotifications } from '../../../contexts';
import type { BulkExportInput, BulkExportResponse } from '../../../types/bulkOperations';
import { propertyService } from '../../../services';

interface Property {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface BulkExportModalProps {
  onClose: () => void;
  open?: boolean;
}

export const BulkExportModal: React.FC<BulkExportModalProps> = ({ onClose, open }) => {
  const [step, setStep] = useState<'configure' | 'processing' | 'result'>('configure');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<BulkExportResponse | null>(null);

  // Export configuration
  const [entityType, setEntityType] = useState<'properties' | 'units' | 'tenants' | 'transactions' | 'payments' | 'receipts'>('properties');
  const [format, setFormat] = useState<'csv' | 'excel' | 'json' | 'pdf'>('csv');
  const [includeDateRange, setIncludeDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectAllProperties, setSelectAllProperties] = useState(true);

  const { addNotification } = useNotifications();

  React.useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertyService.getAll();
      if (response.success && response.data) {
        setProperties(response.data);
        setSelectedProperties(response.data.map(p => p.id));
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handlePropertyToggle = (propertyId: string) => {
    setSelectedProperties(prev => {
      const newSelected = prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId];
      setSelectAllProperties(newSelected.length === properties.length);
      return newSelected;
    });
  };

  const handleSelectAllProperties = (checked: boolean) => {
    setSelectAllProperties(checked);
    setSelectedProperties(checked ? properties.map(p => p.id) : []);
  };

  const handleSubmit = async () => {
    setStep('processing');
    setProcessing(true);

    try {
      const input: BulkExportInput = {
        entityType,
        format,
        propertyIds: selectAllProperties ? undefined : selectedProperties,
      };

      if (includeDateRange && startDate && endDate) {
        input.dateRange = {
          start: new Date(startDate),
          end: new Date(endDate),
        };
      }

      const exportResult = await bulkOperationsService.bulkDataExport(input);
      setResult(exportResult);

      if (exportResult) {
        addNotification({
          type: 'success',
          title: 'Export Completed',
          message: `Data exported successfully as ${format.toUpperCase()}`,
        });

        // Trigger download
        const link = document.createElement('a');
        link.href = exportResult.fileUrl;
        link.download = exportResult.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Bulk export error:', error);
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export data',
      });
      setResult(null);
    } finally {
      setProcessing(false);
      setStep('result');
    }
  };

  const resetModal = () => {
    setStep('configure');
    setResult(null);
    setEntityType('properties');
    setFormat('csv');
    setIncludeDateRange(false);
    setStartDate('');
    setEndDate('');
    setSelectAllProperties(true);
    setSelectedProperties(properties.map(p => p.id));
  };

  const renderConfiguration = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Configure Data Export</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data Type</Label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as typeof entityType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="properties">Properties</option>
            <option value="units">Units</option>
            <option value="tenants">Tenants</option>
            <option value="transactions">Rent Transactions</option>
            <option value="payments">Payments</option>
            <option value="receipts">Receipts</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Export Format</Label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as typeof format)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="json">JSON</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="date-range"
            checked={includeDateRange}
            onCheckedChange={(checked) => setIncludeDateRange(checked as boolean)}
          />
          <Label htmlFor="date-range">Include date range filter</Label>
        </div>

        {includeDateRange && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Properties to Include</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all-properties"
              checked={selectAllProperties}
              onCheckedChange={handleSelectAllProperties}
            />
            <Label htmlFor="select-all-properties" className="text-sm">All Properties</Label>
          </div>
        </div>

        {!selectAllProperties && (
          <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
            {properties.map((property) => (
              <div key={property.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`property-${property.id}`}
                  checked={selectedProperties.includes(property.id)}
                  onCheckedChange={() => handlePropertyToggle(property.id)}
                />
                <Label htmlFor={`property-${property.id}`} className="text-sm flex-1">
                  <div className="font-medium">{property.name}</div>
                  <div className="text-gray-500">
                    {property.address.street}, {property.address.city}
                  </div>
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          This will export {entityType} data in {format.toUpperCase()} format.
          {includeDateRange && startDate && endDate && ` Date range: ${startDate} to ${endDate}.`}
          {!selectAllProperties && ` Selected properties: ${selectedProperties.length}.`}
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
        <h3 className="text-lg font-medium">Exporting Data</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generating {format.toUpperCase()} file for {entityType}...
        </p>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6">
      <div className="text-center">
        {result ? (
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        ) : (
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        )}
        <h3 className="text-lg font-medium mt-4">
          {result ? 'Export Completed' : 'Export Failed'}
        </h3>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-green-500" />
              <span className="font-medium">File Generated</span>
            </div>
            <Badge variant="secondary">{result.fileName}</Badge>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your file has been downloaded automatically. You can also access it later from your downloads folder.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!result && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The export failed. Please try again or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const getStepContent = () => {
    switch (step) {
      case 'configure':
        return renderConfiguration();
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
      case 'configure':
        return 'Configure Export';
      case 'processing':
        return 'Exporting';
      case 'result':
        return 'Results';
      default:
        return 'Bulk Export';
    }
  };

  const canProceed = () => {
    if (includeDateRange && (!startDate || !endDate)) {
      return false;
    }
    if (!selectAllProperties && selectedProperties.length === 0) {
      return false;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>{getStepTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            Export data in various formats for analysis and reporting
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {getStepContent()}
        </div>

        <DialogFooter>
          {step === 'result' ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetModal}>
                Export More Data
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
              {step === 'configure' && (
                <Button onClick={handleSubmit} disabled={processing || !canProceed()}>
                  {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Start Export
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};