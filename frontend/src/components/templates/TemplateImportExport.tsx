import React, { useState } from 'react';
import { Download, Upload, FileJson } from 'lucide-react';
import { Button } from '../ui/button';

interface TemplateImportExportProps {
  templateId: string;
  templateName: string;
  onImportComplete?: () => void;
}

export default function TemplateImportExport({ templateId, templateName, onImportComplete }: TemplateImportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/templates/${templateId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${templateName.replace(/\s+/g, '-').toLowerCase()}-template.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export template');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/templates/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Template imported successfully!');
        onImportComplete?.();
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import template. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Import / Export</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Export */}
        <div className="border rounded-lg p-6 text-center">
          <FileJson className="w-12 h-12 mx-auto mb-3 text-blue-500" />
          <h4 className="font-medium mb-2">Export Template</h4>
          <p className="text-sm text-gray-600 mb-4">Download template as JSON file</p>
          <Button onClick={handleExport} disabled={isExporting} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>

        {/* Import */}
        <div className="border rounded-lg p-6 text-center">
          <Upload className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <h4 className="font-medium mb-2">Import Template</h4>
          <p className="text-sm text-gray-600 mb-4">Upload JSON file to import</p>
          <label className="block">
            <Button disabled={isImporting} className="w-full cursor-pointer" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import'}
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isImporting}
            />
          </label>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Exported templates include all customizations, layouts, and styling. 
          Imported templates will be created as new templates with "(Imported)" suffix.
        </p>
      </div>
    </div>
  );
}
