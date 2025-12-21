import React from 'react';
import { ArrowLeft, FileText, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Alert, AlertDescription } from '@/componentDesignLibrary';
import { AppLayout } from '@/components/layout';
import { useInvoice } from './useInvoice';

export const InvoicePage: React.FC = () => {
  const {
    transactionId,
    loading,
    generating,
    error,
    pdfUrl,
    invoiceNumber,
    generateInvoice,
    handleDownload,
    navigate
  } = useInvoice();

  if (loading || generating) {
    return (
      <AppLayout title="Generating Invoice">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {generating ? 'Generating Invoice...' : 'Loading...'}
              </h3>
              <p className="text-gray-600">
                {generating ? 'Please wait while we generate your invoice PDF.' : 'Preparing invoice page...'}
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Invoice Error">
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
                <h1 className="text-2xl font-bold text-gray-900">Invoice Generation Failed</h1>
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
            <Button onClick={generateInvoice} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
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
    <AppLayout title="Invoice">
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
              <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
              <p className="text-gray-600">
                Invoice #{invoiceNumber} • Transaction ID: {transactionId}
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
                <span>Invoice Generated Successfully</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <iframe
                  src={pdfUrl}
                  className="w-full h-[600px] border rounded-lg"
                  title={`Invoice ${invoiceNumber}`}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Invoice Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Generation</h3>
                <p className="text-gray-600 mb-4">
                  Invoice generation functionality is coming soon.
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
