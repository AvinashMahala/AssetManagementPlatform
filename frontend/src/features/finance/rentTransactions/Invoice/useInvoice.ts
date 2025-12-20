import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rentTransactionService } from '@/services/rentTransactionService';

export const useInvoice = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);

  const generateInvoice = async () => {
    if (!transactionId) return;

    try {
      setGenerating(true);
      setError(null);

      const response = await rentTransactionService.generateInvoice({
        transactionId
      });

      if (response.success && response.data) {
        setPdfUrl(response.data.pdfUrl);
        setInvoiceNumber(response.data.invoiceNumber);
      } else {
        setError(response.message || 'Failed to generate invoice');
      }
    } catch (err) {
      console.error('Invoice generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate invoice');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactionId) {
      generateInvoice();
    }
  }, [transactionId]);

  const handleDownload = () => {
    if (pdfUrl) {
      // Create a temporary link to download the PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `invoice-${invoiceNumber || transactionId}.pdf`;
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
    invoiceNumber,
    generateInvoice,
    handleDownload,
    navigate
  };
};
