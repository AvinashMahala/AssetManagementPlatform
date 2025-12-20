import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { templateService } from '../../../services/templateService';
import { Button, PageLoadingSpinner } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import { Save } from 'lucide-react';
import LogoUploader from '../components/LogoUploader';

export default function PropertyTemplateCustomization() {
  const { propertyId } = useParams();
  const [customization, setCustomization] = useState<any>({
    customStyles: {},
    customLogoUrl: '',
    customHeader: '',
    customFooter: '',
    showQrCode: false,
    qrCodeData: { type: 'receipt' },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPropertyTemplate();
  }, [propertyId]);

  const loadPropertyTemplate = async () => {
    try {
      const response: any = await templateService.getPropertyTemplate(propertyId!);
      if (response.success && response.data) {
        setCustomization(response.data);
      }
    } catch (error) {
      console.error('Failed to load property template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await templateService.updatePropertyTemplate(propertyId!, customization);
      alert('Property template settings saved!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipt Template Settings</h1>
          <p className="text-gray-600">Customize receipt template for this property</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <Tabs defaultValue="branding">
          <TabsList>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="custom">Custom Text</TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-6 pt-6">
            <LogoUploader
              currentLogoUrl={customization.customLogoUrl}
              onUpload={(url) => setCustomization({...customization, customLogoUrl: url})}
              onRemove={() => setCustomization({...customization, customLogoUrl: ''})}
            />
          </TabsContent>

          <TabsContent value="qrcode" className="space-y-6 pt-6">
            <div>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={customization.showQrCode}
                  onChange={(e) => setCustomization({...customization, showQrCode: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="font-medium">Show QR Code on receipts</span>
              </label>

              {customization.showQrCode && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">QR Code Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={customization.qrCodeData?.type || 'receipt'}
                      onChange={(e) => setCustomization({
                        ...customization,
                        qrCodeData: {...customization.qrCodeData, type: e.target.value}
                      })}
                    >
                      <option value="receipt">Receipt URL</option>
                      <option value="payment">Payment Link</option>
                      <option value="property">Property Info</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">QR Code Position</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={customization.qrCodePosition || 'bottom-right'}
                      onChange={(e) => setCustomization({...customization, qrCodePosition: e.target.value})}
                    >
                      <option value="top-right">Top Right</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">QR Code Size (px)</label>
                    <input
                      type="number"
                      value={customization.qrCodeSize || 100}
                      onChange={(e) => setCustomization({...customization, qrCodeSize: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-md"
                      min="50"
                      max="300"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6 pt-6">
            <div>
              <label className="block text-sm font-medium mb-2">Custom Header</label>
              <textarea
                value={customization.customHeader || ''}
                onChange={(e) => setCustomization({...customization, customHeader: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Add custom header text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Custom Footer</label>
              <textarea
                value={customization.customFooter || ''}
                onChange={(e) => setCustomization({...customization, customFooter: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Add custom footer text (e.g., terms & conditions)..."
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
