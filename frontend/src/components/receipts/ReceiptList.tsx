import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Loading } from '../ui/loading';
import { Alert, AlertDescription } from '../ui/alert';
import { receiptService } from '../../services/receiptService';
import type { Receipt } from '../../types/receipt';
import { FileText, Download, Eye, AlertCircle, Calendar, DollarSign } from 'lucide-react';

interface ReceiptListProps {
  tenantId?: string;
  propertyId?: string;
  showHeader?: boolean;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({
  tenantId,
  propertyId,
  showHeader = true,
}) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadReceipts();
  }, [tenantId, propertyId]);

  const loadReceipts = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (tenantId) {
        response = await receiptService.getByTenant(tenantId);
      } else if (propertyId) {
        response = await receiptService.getByProperty(propertyId);
      } else {
        response = await receiptService.getAll();
      }

      if (response.success && response.data) {
        setReceipts(response.data);
      } else {
        setError(response.error?.message || 'Failed to load receipts');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading receipts');
      console.error('Receipt loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (receipt: Receipt) => {
    setDownloadingId(receipt.id);
    setError(null);

    try {
      const blob = await receiptService.downloadReceiptPDF(receipt.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${receipt.receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download receipt PDF');
      console.error('PDF download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'generated':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'downloaded':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loading className="h-6 w-6 mr-2" />
          <span>Loading receipts...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Receipts
              {receipts.length > 0 && (
                <Badge variant="secondary">{receipts.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {receipts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts found</h3>
            <p className="text-gray-500">
              {tenantId
                ? 'No receipts have been generated for this tenant yet.'
                : propertyId
                ? 'No receipts have been generated for this property yet.'
                : 'No receipts have been generated yet.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">
                      {receipt.receiptNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(receipt.receiptDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        ₹{receipt.amount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(receipt.status)}>
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownloadPDF(receipt)}
                          disabled={downloadingId === receipt.id}
                          variant="outline"
                          size="sm"
                        >
                          {downloadingId === receipt.id ? (
                            <Loading className="h-4 w-4" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Could open a modal with receipt details
                            console.log('View receipt details:', receipt);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};