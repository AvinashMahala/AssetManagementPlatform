import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rentTransactionService } from '@/features/finance/services/rentTransactionService';

export const useReceipt = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

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

  useEffect(() => {
    if (transactionId) {
      generateReceipt();
    }
  }, [transactionId]);

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

  return {
    transactionId,
    loading,
    generating,
    error,
    pdfUrl,
    receiptNumber,
    generateReceipt,
    handleDownload,
    navigate
  };
};
