import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateService } from '../services/templateService';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Save, Eye, Sparkles } from 'lucide-react';

interface TemplateConfig {
  layout: any;
  styling: any;
  sections: any[];
}

export default function TemplateEditor() {
  const { templateId, propertyId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [config, setConfig] = useState<TemplateConfig>({
    layout: { margins: { top: 50, right: 50, bottom: 50, left: 50 }, spacing: { section: 20, field: 10 }, pageSize: 'A4', orientation: 'portrait' },
    styling: { theme: { primary: '#2563eb', secondary: '#64748b', text: '#1e293b', background: '#ffffff', border: '#e2e8f0' } },
    sections: [],
  });
  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const response = await templateService.getTemplateById(templateId!) as { success: boolean; data?: any };
      if (response.success && response.data) {
        setTemplate(response.data);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = useCallback(async () => {
    try {
      const response = await templateService.generatePreview({
        templateId: templateId!,
        propertyId,
        customizations: {
          customStyles: config.styling,
        },
        format: 'html',
      }) as any;
      
      if (response && response.success && response.previewHtml) {
        setPreviewHtml(response.previewHtml);
      } else {
        const errorMessage = response?.message || response?.error || 'Unknown error';
        console.error('Failed to generate preview:', errorMessage);
        console.error('Response structure:', response);
        // Show error message to user
        alert('Failed to generate preview: ' + errorMessage);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
      alert('Failed to generate preview. Please try again.');
    }
  }, [templateId, propertyId, config.styling]);

  // Auto-generate preview when config changes
  useEffect(() => {
    if (templateId) {
      generatePreview();
    }
  }, [generatePreview]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (propertyId) {
        await templateService.updatePropertyTemplate(propertyId, { customStyles: config.styling });
      }
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{template?.name || 'Template Editor'}</h1>
            <p className="text-sm text-gray-500">Customize your receipt template</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePreview} disabled>
            <Eye className="w-4 h-4 mr-2" />
            Live Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor Controls */}
        <div className="w-1/2 border-r bg-white overflow-y-auto">
          <div className="p-6">
            <Tabs defaultValue="layout" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="theme">Theme</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="placeholders">Fields</TabsTrigger>
              </TabsList>

              <TabsContent value="layout" className="space-y-6 pt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Page Layout</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Page Size</label>
                      <select 
                        className="w-full px-3 py-2 border rounded-md"
                        value={config.layout.pageSize}
                        onChange={(e) => setConfig({...config, layout: {...config.layout, pageSize: e.target.value}})}
                      >
                        <option value="A4">A4</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Orientation</label>
                      <select 
                        className="w-full px-3 py-2 border rounded-md"
                        value={config.layout.orientation}
                        onChange={(e) => setConfig({...config, layout: {...config.layout, orientation: e.target.value}})}
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Margins</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['top', 'right', 'bottom', 'left'].map(side => (
                      <div key={side}>
                        <label className="block text-sm font-medium mb-2 capitalize">{side}</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border rounded-md"
                          value={config.layout.margins[side]}
                          onChange={(e) => setConfig({...config, layout: {...config.layout, margins: {...config.layout.margins, [side]: parseInt(e.target.value)}}})}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="theme" className="space-y-6 pt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Colors</h3>
                  <div className="space-y-4">
                    {Object.entries(config.styling.theme).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <label className="w-32 text-sm font-medium capitalize">{key}</label>
                        <input
                          type="color"
                          value={value as string}
                          onChange={(e) => setConfig({...config, styling: {...config.styling, theme: {...config.styling.theme, [key]: e.target.value}}})}
                          className="w-16 h-10 border rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-500 font-mono">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sections" className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Section management coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="placeholders" className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Field management coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="w-1/2 bg-gray-100 overflow-y-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-lg p-8 mx-auto" style={{maxWidth: '800px'}}>
              {previewHtml ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <Eye className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Live Preview</p>
                  <p className="text-sm">Changes will appear here automatically</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
