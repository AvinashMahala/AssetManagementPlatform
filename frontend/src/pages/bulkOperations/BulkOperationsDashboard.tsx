import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Receipt,
  CreditCard,
  MessageSquare,
  Download,
  CheckCircle,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { BulkRentCollectionModal } from './BulkRentCollectionModal';
import { BulkPaymentModal } from './BulkPaymentModal';
import { BulkReceiptGenerationModal } from './BulkReceiptGenerationModal';
import { BulkCommunicationModal } from './BulkCommunicationModal';
import { BulkExportModal } from './BulkExportModal';
import { ReceiptValidationDashboard } from './ReceiptValidationDashboard';

type BulkOperationType = 'rent-collection' | 'payments' | 'receipts' | 'communication' | 'export' | 'validation';

interface BulkOperationCard {
  id: BulkOperationType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  features: string[];
}

const bulkOperations: BulkOperationCard[] = [
  {
    id: 'rent-collection',
    title: 'Bulk Rent Collection',
    description: 'Generate rent transactions for multiple units at once',
    icon: DollarSign,
    color: 'bg-green-500',
    features: [
      'Multi-unit selection',
      'Automatic lease validation',
      'Expense application',
      'Skip existing transactions'
    ]
  },
  {
    id: 'payments',
    title: 'Bulk Payment Recording',
    description: 'Record payments for multiple rent transactions simultaneously',
    icon: CreditCard,
    color: 'bg-blue-500',
    features: [
      'Multiple transaction selection',
      'Consistent payment details',
      'Payment reference tracking',
      'Balance updates'
    ]
  },
  {
    id: 'receipts',
    title: 'Bulk Receipt Generation',
    description: 'Generate PDF receipts for multiple transactions',
    icon: Receipt,
    color: 'bg-purple-500',
    features: [
      'Batch PDF generation',
      'Regenerate existing receipts',
      'Automatic file management',
      'Receipt numbering'
    ]
  },
  {
    id: 'communication',
    title: 'Bulk Tenant Communication',
    description: 'Send messages to multiple tenants via email, SMS, or WhatsApp',
    icon: MessageSquare,
    color: 'bg-orange-500',
    features: [
      'Multi-channel messaging',
      'Tenant selection',
      'Attachment support',
      'Communication tracking'
    ]
  },
  {
    id: 'export',
    title: 'Bulk Data Export',
    description: 'Export properties, units, tenants, transactions, and payments',
    icon: Download,
    color: 'bg-indigo-500',
    features: [
      'Multiple data types',
      'Date range filtering',
      'CSV, Excel, JSON, PDF formats',
      'Property/unit filtering'
    ]
  },
  {
    id: 'validation',
    title: 'Receipt Validation',
    description: 'Check for missing or invalid receipts across transactions',
    icon: CheckCircle,
    color: 'bg-red-500',
    features: [
      'Receipt file validation',
      'Missing receipt detection',
      'Property filtering',
      'Bulk fix options'
    ]
  }
];

export const BulkOperationsDashboard: React.FC = () => {
  const [selectedOperation, setSelectedOperation] = useState<BulkOperationType | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleOperationSelect = (operationId: BulkOperationType) => {
    if (operationId === 'validation') {
      setShowValidation(true);
    } else {
      setSelectedOperation(operationId);
    }
  };

  const handleCloseModal = () => {
    setSelectedOperation(null);
  };

  const handleCloseValidation = () => {
    setShowValidation(false);
  };

  if (showValidation) {
    return (
      <AppLayout title="Receipt Validation">
        <ReceiptValidationDashboard onClose={handleCloseValidation} />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Bulk Operations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bulk Operations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Perform large-scale operations efficiently across multiple records
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <CheckCircle className="h-4 w-4 mr-1" />
            6 Operations Available
          </Badge>
        </div>

        {/* Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bulkOperations.map((operation) => {
            const Icon = operation.icon;
            return (
              <Card
                key={operation.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleOperationSelect(operation.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${operation.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {operation.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {operation.description}
                  </CardDescription>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Features:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {operation.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className="w-full mt-4 group-hover:bg-blue-600 transition-colors"
                    variant="outline"
                  >
                    Start Operation
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Quick Stats
            </CardTitle>
            <CardDescription>
              Overview of your bulk operations status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Operations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Validation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed Operations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <BulkRentCollectionModal open={selectedOperation === 'rent-collection'} onClose={handleCloseModal} />
      <BulkPaymentModal open={selectedOperation === 'payments'} onClose={handleCloseModal} />
      <BulkReceiptGenerationModal open={selectedOperation === 'receipts'} onClose={handleCloseModal} />
      <BulkCommunicationModal open={selectedOperation === 'communication'} onClose={handleCloseModal} />
      <BulkExportModal open={selectedOperation === 'export'} onClose={handleCloseModal} />
    </AppLayout>
  );
};