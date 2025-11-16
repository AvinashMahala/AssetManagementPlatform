import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { bulkOperationsService } from '../../services';
import { useNotifications } from '../../contexts';
import type { ReceiptValidationResult } from '../../types/bulkOperations';
import { propertyService } from '../../services';

interface Property {
  id: string;
  name: string;
}

interface ReceiptValidationDashboardProps {
  onClose?: () => void;
}

export const ReceiptValidationDashboard: React.FC<ReceiptValidationDashboardProps> = ({ onClose }) => {
  const [validationResult, setValidationResult] = useState<ReceiptValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [fixingReceipts, setFixingReceipts] = useState(false);

  const { addNotification } = useNotifications();

  useEffect(() => {
    loadProperties();
    loadValidationResults();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertyService.getAll();
      if (response.success && response.data) {
        setProperties(response.data);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const loadValidationResults = async () => {
    setLoading(true);
    try {
      const result = await bulkOperationsService.validateReceipts(selectedProperty || undefined);
      setValidationResult(result);
    } catch (error) {
      console.error('Error validating receipts:', error);
      addNotification({
        type: 'error',
        title: 'Validation Failed',
        message: 'Failed to validate receipts',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMissingReceipts = async () => {
    if (!validationResult || validationResult.missing === 0) return;

    setFixingReceipts(true);
    try {
      // Filter missing receipts and generate them
      const missingReceipts = validationResult.details.filter(detail => detail.status === 'missing');
      const transactionIds = missingReceipts.map(detail => detail.transactionId);

      const result = await bulkOperationsService.bulkReceiptGeneration({
        transactionIds,
        regenerateExisting: false,
      });

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Receipts Generated',
          message: `Successfully generated ${result.processed} missing receipts`,
        });
        // Reload validation results
        loadValidationResults();
      } else {
        addNotification({
          type: 'error',
          title: 'Generation Failed',
          message: result.errors.join(', '),
        });
      }
    } catch (error) {
      console.error('Error generating receipts:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate missing receipts',
      });
    } finally {
      setFixingReceipts(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Valid</Badge>;
      case 'invalid':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Invalid</Badge>;
      case 'missing':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Missing</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredDetails = validationResult?.details || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 mt-1">
            Validate and manage receipt generation across all transactions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={loadValidationResults}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Validated</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {validationResult ? validationResult.valid + validationResult.invalid + validationResult.missing : 0}
            </div>
            <p className="text-xs text-gray-600">Total receipts checked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Receipts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {validationResult?.valid || 0}
            </div>
            <p className="text-xs text-gray-600">Receipts are properly generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {validationResult ? validationResult.invalid + validationResult.missing : 0}
            </div>
            <p className="text-xs text-gray-600">Invalid or missing receipts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Receipts</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {validationResult?.missing || 0}
            </div>
            <p className="text-xs text-gray-600">Receipts need to be generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Results</CardTitle>
          <CardDescription>
            Detailed breakdown of receipt validation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Property
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onBlur={loadValidationResults}
                >
                  <option value="">All Properties</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              {validationResult && validationResult.missing > 0 && (
                <Button
                  onClick={handleGenerateMissingReceipts}
                  disabled={fixingReceipts}
                  className="flex items-center space-x-2"
                >
                  {fixingReceipts ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span>Generate Missing Receipts ({validationResult.missing})</span>
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2">Validating receipts...</span>
            </div>
          ) : filteredDetails.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts to validate</h3>
              <p className="text-gray-500">
                {selectedProperty ? 'No transactions found for the selected property.' : 'No transactions found in the system.'}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Receipt Number</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDetails.map((detail) => (
                    <TableRow key={detail.transactionId}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(detail.status)}
                          {getStatusBadge(detail.status)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {detail.transactionId}
                      </TableCell>
                      <TableCell>
                        {detail.receiptNumber || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {detail.issues.length > 0 ? (
                          <div className="space-y-1">
                            {detail.issues.map((issue, index) => (
                              <div key={index} className="text-sm text-red-600">
                                • {issue}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">No issues</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {detail.receiptGenerated && (
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                          {detail.status === 'missing' && (
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              Generate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {validationResult && (validationResult.invalid > 0 || validationResult.missing > 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Action Required:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationResult.missing > 0 && (
                <li>{validationResult.missing} receipts are missing and need to be generated</li>
              )}
              {validationResult.invalid > 0 && (
                <li>{validationResult.invalid} receipts have validation issues that need to be addressed</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};