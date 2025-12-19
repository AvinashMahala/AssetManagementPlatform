import React, { useState } from 'react';
import { Button } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/componentDesignLibrary';
import { Alert, AlertDescription } from '@/componentDesignLibrary';
import { Loading } from '@/componentDesignLibrary';
import { receiptService } from '../../services/receiptService';
import type { ReceiptGenerationRequest, Receipt } from '../../types/receipt';
import { Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface ReceiptGeneratorProps {
  paymentId: string;
  tenantName: string;
  amount: number;
  onReceiptGenerated?: (receipt: Receipt) => void;
}

export const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  paymentId,
  tenantName,
  amount,
  onReceiptGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerateReceipt = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const request: ReceiptGenerationRequest = {
        paymentId,
      };

      const response = await receiptService.generateReceipt(request);

      if (response.success && response.data) {
        setGeneratedReceipt(response.data);
        setSuccess('Receipt generated successfully!');
        onReceiptGenerated?.(response.data);
      } else {
        setError(response.error?.message || 'Failed to generate receipt');
      }
    } catch (err) {
      setError('An unexpected error occurred while generating the receipt');
      console.error('Receipt generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedReceipt) return;

    setIsDownloading(true);
    setError(null);

    try {
      const blob = await receiptService.downloadReceiptPDF(generatedReceipt.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${generatedReceipt.receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Receipt PDF downloaded successfully!');
    } catch (err) {
      setError('Failed to download receipt PDF');
      console.error('PDF download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedReceipt) return;

    // In a real app, you'd get the email from a form or user input
    const email = prompt('Enter email address to send receipt:');
    if (!email) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await receiptService.sendReceiptByEmail(generatedReceipt.id, email);

      if (response.success) {
        setSuccess(`Receipt sent to ${email} successfully!`);
      } else {
        setError(response.error?.message || 'Failed to send receipt');
      }
    } catch (err) {
      setError('Failed to send receipt by email');
      console.error('Email send error:', err);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Receipt Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tenant:</span> {tenantName}
              </div>
              <div>
                <span className="font-medium">Amount:</span> ₹{amount.toLocaleString()}
              </div>
            </div>

            {!generatedReceipt ? (
              <Button
                onClick={handleGenerateReceipt}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loading className="mr-2 h-4 w-4" />
                    Generating Receipt...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Receipt
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Receipt #{generatedReceipt.receiptNumber} generated
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {isDownloading ? (
                      <>
                        <Loading className="mr-2 h-4 w-4" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Receipt Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Receipt Number:</span>
                            <p>{generatedReceipt.receiptNumber}</p>
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>
                            <p>{new Date(generatedReceipt.receiptDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span>
                            <p>₹{generatedReceipt.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <p className="capitalize">{generatedReceipt.status}</p>
                          </div>
                        </div>

                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-sm mt-1">{generatedReceipt.description}</p>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleDownloadPDF} disabled={isDownloading}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                          <Button onClick={handleSendEmail} variant="outline">
                            Send Email
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};