import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { HardDrive, FileImage, FileText, FolderOpen } from 'lucide-react';
import type { FileStatsProps } from './FileStats.types';
import './FileStats.scss';

export const FileStats: React.FC<FileStatsProps> = ({
  totalFiles,
  files,
  selectedFilesCount
}) => {
  const stats = useMemo(() => {
    const images = files.filter(f => f.mimeType.startsWith('image/')).length;
    const documents = files.filter(f => f.mimeType === 'application/pdf' || f.mimeType.includes('document')).length;
    const totalSize = files.reduce((sum, f) => sum + f.fileSize, 0);

    return { total: totalFiles, images, documents, totalSize };
  }, [totalFiles, files]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="stats-section grid gap-2 md:grid-cols-2 lg:grid-cols-4">
      <Card className="stat-card hover:shadow-md transition-shadow" style={{ '--index': 0 } as React.CSSProperties}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground">Total Files</CardTitle>
          <div className="stat-icon-container bg-indigo-50 dark:bg-indigo-900/20 p-1.5 rounded-lg">
            <HardDrive className="stat-icon h-4 w-4 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="stat-value text-2xl font-bold">{stats.total}</div>
          <p className="stat-subtext text-xs text-muted-foreground mt-1">{formatFileSize(stats.totalSize)} total</p>
        </CardContent>
      </Card>

      <Card className="stat-card hover:shadow-md transition-shadow" style={{ '--index': 1 } as React.CSSProperties}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground">Images</CardTitle>
          <div className="stat-icon-container bg-purple-50 dark:bg-purple-900/20 p-1.5 rounded-lg">
            <FileImage className="stat-icon h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="stat-value text-2xl font-bold">{stats.images}</div>
          <p className="stat-subtext text-xs text-muted-foreground mt-1">Photo files</p>
        </CardContent>
      </Card>

      <Card className="stat-card hover:shadow-md transition-shadow" style={{ '--index': 2 } as React.CSSProperties}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground">Documents</CardTitle>
          <div className="stat-icon-container bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-lg">
            <FileText className="stat-icon h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="stat-value text-2xl font-bold">{stats.documents}</div>
          <p className="stat-subtext text-xs text-muted-foreground mt-1">PDF & docs</p>
        </CardContent>
      </Card>

      <Card className="stat-card hover:shadow-md transition-shadow" style={{ '--index': 3 } as React.CSSProperties}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground">Selected</CardTitle>
          <div className="stat-icon-container bg-green-50 dark:bg-green-900/20 p-1.5 rounded-lg">
            <FolderOpen className="stat-icon h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="stat-value text-2xl font-bold">{selectedFilesCount}</div>
          <p className="stat-subtext text-xs text-muted-foreground mt-1">For bulk actions</p>
        </CardContent>
      </Card>
    </div>
  );
};