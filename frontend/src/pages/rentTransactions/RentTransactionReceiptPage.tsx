import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Alert, AlertDescription } from '@/componentDesignLibrary';
import { AppLayout } from '../../components/layout';
import { rentTransactionService } from '../../services/rentTransactionService';

export const RentTransactionReceiptPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

  useEffect(() => {
    if (transactionId) {
      generateReceipt();
    }
  }, [transactionId]);

  const generateReceipt = async () => {
    if (!transactionId) return;

    try {
      setGenerating(true);
      setError(null);

      const response = await rentTransactionService.generateReceipt({
        transactionId
      });

      if (response.success && response.data) {
        setPdfUrl(response.data.pdfUrl);
        setReceiptNumber(response.data.receiptNumber);
      } else {
        setError(response.message || 'Failed to generate receipt');
      }
    } catch (err) {
      console.error('Receipt generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate receipt');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      // Create a temporary link to download the PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `receipt-${receiptNumber || transactionId}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading || generating) {
    return (
      <AppLayout title="Generating Receipt">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {generating ? 'Generating Receipt...' : 'Loading...'}
              </h3>
              <p className="text-gray-600">
                {generating ? 'Please wait while we generate your receipt PDF.' : 'Preparing receipt page...'}
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Receipt Error">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Receipt Generation Failed</h1>
                <p className="text-gray-600">Transaction ID: {transactionId}</p>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>

          <div className="mt-6">
            <Button onClick={generateReceipt} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Payment Receipt">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Receipt</h1>
              <p className="text-gray-600">
                Receipt #{receiptNumber} • Transaction ID: {transactionId}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={!pdfUrl}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {pdfUrl ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Receipt Generated Successfully</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <iframe
                  src={pdfUrl}
                  className="w-full h-[600px] border rounded-lg"
                  title={`Receipt ${receiptNumber}`}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Receipt Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Receipt Generation</h3>
                <p className="text-gray-600 mb-4">
                  Receipt generation functionality is coming soon.
                </p>
                <p className="text-sm text-gray-500">
                  Transaction ID: {transactionId}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};