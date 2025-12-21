import React, { useState, useEffect } from 'react';
import { FileText, Image, Download } from 'lucide-react';
import { Card, CardContent } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import fileService from '@/features/files/services/fileService';
import type { FileMetadata } from '@/features/files/types';

interface RecentFilesWidgetProps {
  limit?: number;
  className?: string;
  onFileClick?: (file: FileMetadata) => void;
}

const RecentFilesWidget: React.FC<RecentFilesWidgetProps> = ({
  limit = 5,
  className = '',
  onFileClick
}) => {
  const [recentFiles, setRecentFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentFiles = async () => {
      try {
        setLoading(true);
        const response = await fileService.listAllFiles({
          limit,
          offset: 0
        });

        if (response.success && response.data) {
          // Sort by upload date (most recent first)
          const sortedFiles = response.data.files.sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
          setRecentFiles(sortedFiles.slice(0, limit));
        }
      } catch (error) {
        console.error('Failed to load recent files:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentFiles();
  }, [limit]);

  const getFileIcon = (file: FileMetadata) => {
    if (file.mimeType.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
    if (file.mimeType === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const uploadDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return uploadDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {recentFiles.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onFileClick?.(file)}
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(file.uploadedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(fileService.getDownloadUrl(file.id), '_blank');
                    }}
                    className="h-6 w-6 p-0"
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Badge variant="outline" className="text-xs">
                    {file.category || 'General'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentFilesWidget;