import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, File, Image, FileText, Calendar, Upload, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfirmDialog } from '../../componentDesignLibrary';
import { propertyService } from '../../services';
import type { PropertyFile } from '../../types/property';
import { format } from 'date-fns';

interface PropertyFileGalleryProps {
  propertyId: string;
  onFileDeleted?: (fileId: string) => void;
  className?: string;
  refreshTrigger?: number;
}

interface PropertyFileViewerProps {
  file: PropertyFile;
  propertyId: string;
  onClose: () => void;
}

const PropertyFileViewer: React.FC<PropertyFileViewerProps> = ({ file, propertyId }) => {
  const [blobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        // For property files, we need to download from the FileStorageService using the fileId
        // This requires implementing a download method in propertyService or using fileService
        // For now, we'll show a placeholder
        setError('File viewing not yet implemented for property files');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [file]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.open(`/api/properties/${propertyId}/files/${file.id}/download`, '_blank')}>
            Download Instead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      {blobUrl && (
        <iframe
          src={blobUrl}
          className="w-full h-full border-0"
          title={`View ${file.fileName}`}
        />
      )}
    </div>
  );
};

const PropertyFileGallery: React.FC<PropertyFileGalleryProps> = ({
  propertyId,
  onFileDeleted,
  className = '',
  refreshTrigger = 0
}) => {
  const [files, setFiles] = useState<PropertyFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<PropertyFile | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, [propertyId, refreshTrigger]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyService.getPropertyFiles(propertyId);
      if (response.success && response.data) {
        setFiles(response.data);
      } else {
        setError(response.error?.message || 'Failed to load files');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: PropertyFile) => {
    try {
      // Create a download link for property files
      const link = document.createElement('a');
      link.href = `/api/properties/${propertyId}/files/${file.id}/download`;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await propertyService.deletePropertyFile(propertyId, fileId);
      if (response.success) {
        setFiles(files.filter(f => f.id !== fileId));
        onFileDeleted?.(fileId);
      } else {
        setError(response.error?.message || 'Failed to delete file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleUpload(selectedFiles[0]);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadError(null);

      // Determine file type based on MIME type
      const fileType = file.type.startsWith('image/') ? 'photo' : 'document';

      const response = await propertyService.uploadPropertyFile(propertyId, file, fileType);

      if (response.success && response.data) {
        setFiles(prevFiles => [response.data!, ...prevFiles]);
      } else {
        setUploadError(response.error?.message || 'Failed to upload file');
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    if (fileType === 'photo') {
      return <Image className="h-8 w-8 text-blue-500" />;
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'txt':
        return <File className="h-8 w-8 text-gray-500" />;
      default:
        return <File className="h-8 w-8 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading property files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadFiles} variant="outline" className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">No files uploaded for this property yet.</p>
        <div className="flex flex-col items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
          {uploadError && (
            <p className="text-red-600 text-sm">{uploadError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Upload Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upload New Files</h3>
        </div>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Add Files'}
          </Button>
          {uploadError && (
            <p className="text-red-600 text-sm">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Files Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {files.map((file) => (
          <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.fileType, file.fileName)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file.fileType === 'photo' ? 'Photo' : 'Document'}
                  </p>
                </div>
              </div>
              <Badge variant={file.fileType === 'photo' ? 'default' : 'secondary'}>
                {file.fileType}
              </Badge>
            </div>

            {file.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {file.description}
              </p>
            )}

            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewingFile(file)}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(file)}
                className="flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeletingFileId(file.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* File Viewer Dialog */}
      {viewingFile && (
        <Dialog open={!!viewingFile} onOpenChange={() => setViewingFile(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{viewingFile.fileName}</DialogTitle>
            </DialogHeader>
            <PropertyFileViewer
              file={viewingFile}
              propertyId={propertyId}
              onClose={() => setViewingFile(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingFileId}
        onOpenChange={(open) => !open && setDeletingFileId(null)}
        title="Delete File"
        description="Are you sure you want to delete this file? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => deletingFileId && handleDelete(deletingFileId)}
        variant="destructive"
      />
    </>
  );
};

export default PropertyFileGallery;