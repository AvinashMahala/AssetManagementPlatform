import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Upload, X, Crop } from 'lucide-react';

interface LogoUploaderProps {
  currentLogoUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export default function LogoUploader({ currentLogoUrl, onUpload, onRemove }: LogoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 for now - in production, upload to cloud storage
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Logo</h3>

      {currentLogoUrl ? (
        <div className="relative inline-block">
          <img src={currentLogoUrl} alt="Logo" className="max-w-xs max-h-32 border rounded" />
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">Drag and drop your logo here, or</p>
          <label className="cursor-pointer">
            <span className="text-blue-600 hover:text-blue-700 font-medium">browse files</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, SVG up to 5MB</p>
        </div>
      )}

      {isUploading && (
        <div className="text-sm text-gray-600">Uploading...</div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">Logo Position</label>
          <select className="w-full px-3 py-2 border rounded-md">
            <option value="top-left">Top Left</option>
            <option value="top-center">Top Center</option>
            <option value="top-right">Top Right</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2">Width (px)</label>
            <input type="number" defaultValue={120} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Height (px)</label>
            <input type="number" defaultValue={60} className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
