import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, File, Image, FileText, Video, Archive, Calendar, User } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Card } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/componentDesignLibrary';
import { ConfirmDialog } from '@/componentDesignLibrary';
import { fileService } from '@/services';
import type { FileMetadata } from '@/features/files/types';
import { format } from 'date-fns';

interface FileGalleryProps {
  entityType: 'property' | 'unit' | 'tenant';
  entityId: string;
  category?: string;
  onFileDeleted?: (fileId: string) => void;
  className?: string;
}

interface FileViewerProps {
  file: FileMetadata;
  onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ file }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        const blob = await fileService.downloadFile(file.id);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
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
  }, [file.id]);

  const renderFileContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading file...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading file</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      );
    }

    if (!blobUrl) return null;

    if (file.mimeType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-96">
          <img
            src={blobUrl}
            alt={file.originalName}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    if (file.mimeType === 'application/pdf') {
      return (
        <div className="h-96">
          <iframe
            src={blobUrl}
            className="w-full h-full border-0"
            title={file.originalName}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">{file.originalName}</p>
          <p className="text-sm text-gray-500 mb-4">
            {file.mimeType} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
          <Button asChild>
            <a href={blobUrl} download={file.originalName}>
              Download File
            </a>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh]">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <File className="h-5 w-5" />
          <span>{file.originalName}</span>
        </DialogTitle>
      </DialogHeader>
      {renderFileContent()}
    </DialogContent>
  );
};

const FileGallery: React.FC<FileGalleryProps> = ({
  entityType,
  entityId,
  category,
  onFileDeleted,
  className = ''
}) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<FileMetadata | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [entityType, entityId, category]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fileService.listEntityFiles(entityType, entityId);
      if (response.success && response.data) {
        setFiles(response.data.files);
      } else {
        setError(response.error?.message || 'Failed to load files');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileMetadata) => {
    try {
      const blob = await fileService.downloadFile(file.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      onFileDeleted?.(fileId);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingFileId(null);
    }
  };

  const getFileIcon = (file: FileMetadata) => {
    if (file.mimeType.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (file.mimeType === 'application/pdf') return <FileText className="h-6 w-6" />;
    if (file.mimeType.startsWith('video/')) return <Video className="h-6 w-6" />;
    if (file.mimeType.includes('zip') || file.mimeType.includes('rar') || file.mimeType.includes('7z')) return <Archive className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>Error loading files: {error}</p>
          <Button onClick={loadFiles} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No files uploaded yet</p>
          <p className="text-sm">Upload files to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {files.map((file) => (
          <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-blue-500">
                  {getFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-sm" title={file.originalName}>
                    {file.originalName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.fileSize)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {file.category && (
                <Badge variant="outline" className="text-xs">
                  {file.category}
                </Badge>
              )}

              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(file.uploadedAt), 'MMM dd, yyyy')}</span>
                </div>
                {file.uploadedBy && (
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{file.uploadedBy}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingFile(file)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingFileId(file.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* File Viewer Dialog */}
      {viewingFile && (
        <Dialog open={!!viewingFile} onOpenChange={() => setViewingFile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingFile.originalName}</DialogTitle>
              <DialogDescription className="sr-only">
                Preview of {viewingFile.originalName}
              </DialogDescription>
            </DialogHeader>
            <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingFileId && (
        <ConfirmDialog
          open={!!deletingFileId}
          onOpenChange={(open) => !open && setDeletingFileId(null)}
          onConfirm={() => handleDelete(deletingFileId)}
          title="Delete File"
          description={`Are you sure you want to delete this file? This action cannot be undone.`}
          variant="destructive"
          confirmLabel="Delete"
        />
      )}
    </>
  );
};

export default FileGallery;