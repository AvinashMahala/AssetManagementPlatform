import { useState, useEffect } from 'react';
import { templateService } from '../../services/templateService';
import { Button } from '../ui/button';
import { X, Download } from 'lucide-react';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  onGenerate: () => void;
}

export default function ReceiptPreviewModal({ isOpen, onClose, paymentId, onGenerate }: ReceiptPreviewModalProps) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      loadPreview();
    }
  }, [isOpen, paymentId]);

  const loadPreview = async () => {
    setIsLoading(true);
    try {
      // Get default template
      const templatesResponse = await templateService.getAllTemplates() as { success: boolean; data?: any[] };
      if (templatesResponse.success && templatesResponse.data && templatesResponse.data.length > 0) {
        const defaultTemplate = templatesResponse.data.find((t: any) => t.isDefault) || templatesResponse.data[0];

        // Generate preview with payment data
        const previewResponse = await templateService.generatePreview({
          templateId: defaultTemplate.id,
          format: 'html',
        }) as { success: boolean; data?: { previewHtml: string } };

        if (previewResponse.success && previewResponse.data) {
          setPreviewHtml(previewResponse.data.previewHtml);
        }
      }
    } catch (error) {
      console.error('Failed to load preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    onGenerate();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Receipt Preview</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview Content */}
          <div className="bg-gray-50 px-6 py-8 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading preview...</div>
              </div>
            ) : previewHtml ? (
              <div className="bg-white rounded-lg shadow-lg p-8 mx-auto" style={{maxWidth: '800px'}}>
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Failed to generate preview</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleGenerate}>
              <Download className="w-4 h-4 mr-2" />
              Generate & Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
