import React, { useState, useCallback } from 'react';
import { Upload, X, File, Image, Eye, Download } from 'lucide-react';
import { Button, Badge } from '../../componentDesignLibrary';
import type { PropertyFile } from '../../types/property';

interface PropertyFileUploadProps {
  files: PropertyFile[];
  onFilesChange: (files: PropertyFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

const PropertyFileUpload: React.FC<PropertyFileUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 20,
  maxFileSize = 10,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt']
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
    e.target.value = ''; // Reset input
  }, []);

  const handleFiles = async (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);

    try {
      const validFiles = newFiles.filter(file => {
        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is ${maxFileSize}MB`);
          return false;
        }

        // Check file type
        const isValidType = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(type.replace('*', '.*'));
        });

        if (!isValidType) {
          alert(`${file.name} has an invalid file type`);
          return false;
        }

        return true;
      });

      // In a real implementation, you would upload files to the server here
      // For now, we'll create mock PropertyFile objects
      const propertyFiles: PropertyFile[] = validFiles.map(file => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        propertyId: '', // Will be set when uploaded
        fileId: `temp-file-${Date.now()}-${Math.random()}`,
        fileName: file.name,
        fileType: file.type.startsWith('image/') ? 'photo' : 'document',
        uploadedAt: new Date().toISOString(),
        description: ''
      }));

      onFilesChange([...files, ...propertyFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileType: string) => {
    return fileType === 'photo' ? <Image className="h-4 w-4" /> : <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className={`mx-auto h-12 w-12 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Drop files here or{' '}
              <span className="text-blue-600 hover:text-blue-500">browse</span>
            </span>
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            disabled={uploading || files.length >= maxFiles}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Up to {maxFiles} files, max {maxFileSize}MB each
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supported: Images, PDF, Word documents
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files ({files.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.fileType} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.fileType === 'photo' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled
                      className="p-1"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled
                    className="p-1"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Type Summary */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          Photos: {files.filter(f => f.fileType === 'photo').length}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Documents: {files.filter(f => f.fileType === 'document').length}
        </Badge>
      </div>
    </div>
  );
};

export default PropertyFileUpload;