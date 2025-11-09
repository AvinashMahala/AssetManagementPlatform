import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Video, Archive, AlertCircle, CheckCircle, Edit3, Check, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { fileService } from '../../services';
import type { FileUploadRequest, FileMetadata } from '../../types/file';

interface FileUploadProps {
  entityType?: 'property' | 'unit' | 'tenant'; // Optional for general uploads
  entityId?: string; // Optional for general uploads
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
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  customName?: string;
  isEditingName?: boolean;
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

  const handleFiles = useCallback((files: FileList | null) => {
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

    // Add files to queue with pending status
    const pendingUploads: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending',
      customName: file.name // Default to original filename
    }));

    setUploads(prev => [...prev, ...pendingUploads]);
  }, [maxFileSize, acceptedTypes, multiple, onUploadError]);

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

  const startEditingName = (file: File) => {
    setUploads(prev => prev.map(u =>
      u.file === file
        ? { ...u, isEditingName: true }
        : u
    ));
  };

  const saveCustomName = (file: File, newName: string) => {
    setUploads(prev => prev.map(u =>
      u.file === file
        ? { ...u, customName: newName, isEditingName: false }
        : u
    ));
  };

  const cancelEditingName = (file: File) => {
    setUploads(prev => prev.map(u =>
      u.file === file
        ? { ...u, isEditingName: false }
        : u
    ));
  };

  const resetToOriginalName = (file: File) => {
    setUploads(prev => prev.map(u =>
      u.file === file
        ? { ...u, customName: file.name }
        : u
    ));
  };

  const retryUpload = (file: File) => {
    setUploads(prev => prev.map(u =>
      u.file === file
        ? { ...u, status: 'pending', error: undefined, progress: 0 }
        : u
    ));
  };

  const startUpload = useCallback(async () => {
    const pendingUploads = uploads.filter(u => u.status === 'pending');
    if (pendingUploads.length === 0) return;

    setIsUploading(true);

    // Update status to uploading
    setUploads(prev => prev.map(u =>
      u.status === 'pending' ? { ...u, status: 'uploading' } : u
    ));

    // Upload files
    for (const upload of pendingUploads) {
      try {
        const uploadRequest: FileUploadRequest = {
          file: upload.file,
          entityType: entityType || undefined,
          entityId: entityId || undefined,
          category,
          customName: upload.customName
        };

        const result = await fileService.uploadFile(uploadRequest);

        if (result.success && result.data) {
          // Fetch the file metadata
          const metadataResult = await fileService.getFileMetadata(result.data.fileId);
          if (metadataResult.success && metadataResult.data) {
            // Update progress to success
            setUploads(prev => prev.map(u =>
              u.file === upload.file
                ? { ...u, progress: 100, status: 'success' }
                : u
            ));

            onUploadSuccess?.(metadataResult.data);
          } else {
            throw new Error(metadataResult.error?.message || 'Failed to get file metadata');
          }
        } else {
          throw new Error(result.error?.message || 'Upload failed');
        }

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
  }, [uploads, entityType, entityId, category, onUploadSuccess, onUploadError]);

  const clearCompleted = () => {
    setUploads(prev => prev.filter(u => u.status !== 'success' && u.status !== 'error'));
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
            <h3 className="font-medium">
              Files Ready to Upload ({uploads.filter(u => u.status === 'pending').length} pending)
            </h3>
            <div className="flex space-x-2">
              {uploads.some(u => u.status === 'pending') && (
                <Button
                  onClick={startUpload}
                  disabled={isUploading}
                  size="sm"
                >
                  {isUploading ? 'Uploading...' : 'Start Upload'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompleted}
                disabled={isUploading}
              >
                Clear Completed
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {uploads.map((upload, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getFileIcon(upload.file)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    {upload.isEditingName ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <Input
                          value={upload.customName || ''}
                          onChange={(e) => {
                            setUploads(prev => prev.map(u =>
                              u.file === upload.file
                                ? { ...u, customName: e.target.value }
                                : u
                            ));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveCustomName(upload.file, upload.customName || upload.file.name);
                            } else if (e.key === 'Escape') {
                              cancelEditingName(upload.file);
                            }
                          }}
                          className="flex-1 text-sm"
                          placeholder="Enter filename..."
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveCustomName(upload.file, upload.customName || upload.file.name)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelEditingName(upload.file)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium truncate">
                          {upload.customName || upload.file.name}
                        </p>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingName(upload.file)}
                            className="h-6 w-6 p-0"
                            title="Rename file"
                            disabled={upload.status === 'uploading'}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          {upload.customName !== upload.file.name && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetToOriginalName(upload.file)}
                              className="h-6 w-6 p-0"
                              title="Reset to original name"
                              disabled={upload.status === 'uploading'}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                    <Badge
                      variant={
                        upload.status === 'success' ? 'default' :
                        upload.status === 'error' ? 'destructive' :
                        upload.status === 'pending' ? 'outline' : 'secondary'
                      }
                      className="ml-2"
                    >
                      {upload.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {upload.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {upload.status === 'pending' ? 'Ready' :
                       upload.status === 'uploading' ? 'Uploading' :
                       upload.status}
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
                    <div className="mt-2 space-y-2">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {upload.error}
                        </AlertDescription>
                      </Alert>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryUpload(upload.file)}
                        className="w-full"
                        disabled={isUploading}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Retry Upload
                      </Button>
                    </div>
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