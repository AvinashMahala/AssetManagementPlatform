import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Video, Archive, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { fileService } from '../../services';
import type { FileUploadRequest, FileMetadata } from '../../types/file';

interface FileUploadProps {
  entityType: 'property' | 'unit' | 'tenant';
  entityId: string;
  category?: string;
  onUploadSuccess?: (file: FileMetadata) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[]; // MIME types
  multiple?: boolean;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  entityType,
  entityId,
  category = 'general',
  onUploadSuccess,
  onUploadError,
  maxFileSize = 10, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*'],
  multiple = true,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return `File type ${file.type} is not accepted`;
    }

    return null;
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join('; '));
      return;
    }

    if (!multiple && validFiles.length > 1) {
      onUploadError?.('Only one file can be uploaded at a time');
      return;
    }

    // Initialize upload progress
    const initialUploads: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploads(prev => [...prev, ...initialUploads]);
    setIsUploading(true);

    // Upload files
    for (const upload of initialUploads) {
      try {
        const uploadRequest: FileUploadRequest = {
          file: upload.file,
          entityType,
          entityId,
          category,
          description: `${upload.file.name} uploaded to ${entityType}`
        };

        const result = await fileService.uploadFile(uploadRequest);

        // Update progress to success
        setUploads(prev => prev.map(u =>
          u.file === upload.file
            ? { ...u, progress: 100, status: 'success' }
            : u
        ));

        onUploadSuccess?.(result.file);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploads(prev => prev.map(u =>
          u.file === upload.file
            ? { ...u, progress: 0, status: 'error', error: errorMessage }
            : u
        ));
        onUploadError?.(errorMessage);
      }
    }

    setIsUploading(false);
  }, [entityType, entityId, category, maxFileSize, acceptedTypes, multiple, onUploadSuccess, onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(u => u.file !== file));
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(u => u.status === 'uploading'));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="p-8 text-center">
          <Upload className={`mx-auto h-12 w-12 mb-4 ${
            isDragOver ? 'text-primary' : 'text-gray-400'
          }`} />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500">
              or click to browse files
            </p>
            <p className="text-xs text-gray-400">
              Max file size: {maxFileSize}MB • Accepted: {acceptedTypes.join(', ')}
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </Card>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Upload Progress</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompleted}
              disabled={isUploading}
            >
              Clear Completed
            </Button>
          </div>

          <div className="space-y-3">
            {uploads.map((upload, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getFileIcon(upload.file)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {upload.file.name}
                    </p>
                    <Badge
                      variant={
                        upload.status === 'success' ? 'default' :
                        upload.status === 'error' ? 'destructive' : 'secondary'
                      }
                      className="ml-2"
                    >
                      {upload.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {upload.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {upload.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-500">
                    {formatFileSize(upload.file.size)}
                  </p>

                  {upload.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {upload.progress}% uploaded
                      </p>
                    </div>
                  )}

                  {upload.status === 'error' && upload.error && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {upload.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUpload(upload.file)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;