import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { HardDrive, Image, FileVideo, FileAudio, FileText, Archive, Download, Trash2, Upload, CheckSquare, Square } from 'lucide-react';
import { format } from 'date-fns';
import { fileService } from '../../../services';
import type { FileMetadata } from '../../../types/file';
import type { FileTableProps } from './FileTable.types';
import './FileTable.scss';

export const FileTable: React.FC<FileTableProps> = ({
  files,
  selectedFiles,
  onFileSelection,
  onSelectAll,
  onDeleteFile,
  filters,
  onUploadClick
}) => {
  const getFileIcon = (file: FileMetadata) => {
    if (file.mimeType.startsWith('image/')) return <Image className="h-6 w-6 text-blue-500" />;
    if (file.mimeType.startsWith('video/')) return <FileVideo className="h-6 w-6 text-purple-500" />;
    if (file.mimeType.startsWith('audio/')) return <FileAudio className="h-6 w-6 text-green-500" />;
    if (file.mimeType === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />;
    if (file.mimeType.includes('zip') || file.mimeType.includes('rar')) return <Archive className="h-6 w-6 text-yellow-500" />;
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEntityTypeLabel = (entityType?: string) => {
    if (!entityType) return 'General';
    switch (entityType) {
      case 'property': return 'Property';
      case 'unit': return 'Unit';
      case 'tenant': return 'Tenant';
      default: return entityType;
    }
  };

  const getCategoryLabel = (category?: string) => {
    if (!category) return 'General';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="table-view">
      <Table>
        <TableHeader className="table-header bg-blue-50 dark:bg-blue-950">
          <TableRow>
            <TableHead className="w-12 px-2 py-1 text-xs">
              <button
                onClick={() => onSelectAll(selectedFiles.size !== files.length)}
                className="flex items-center justify-center w-5 h-5 hover:bg-gray-100 rounded"
                title={selectedFiles.size === files.length ? "Deselect all" : "Select all"}
              >
                {selectedFiles.size === files.length && files.length > 0 ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </TableHead>
            <TableHead className="w-[30%] min-w-[200px] px-2 py-1 text-xs">Name</TableHead>
            <TableHead className="w-[10%] min-w-[80px] px-2 py-1 text-xs">Type</TableHead>
            <TableHead className="w-[10%] min-w-[80px] px-2 py-1 text-xs">Size</TableHead>
            <TableHead className="w-[12%] min-w-[100px] px-2 py-1 text-xs">Category</TableHead>
            <TableHead className="w-[12%] min-w-[100px] px-2 py-1 text-xs">Entity</TableHead>
            <TableHead className="w-[13%] min-w-[100px] px-2 py-1 text-xs">Uploaded</TableHead>
            <TableHead className="w-[13%] min-w-[120px] px-2 py-1 text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id} className="table-row hover:bg-orange-50 dark:hover:bg-orange-950/20">
              <TableCell className="px-2 py-1">
                <button
                  onClick={() => onFileSelection(file.id, !selectedFiles.has(file.id))}
                  className="flex items-center justify-center w-5 h-5 hover:bg-gray-100 rounded"
                >
                  {selectedFiles.has(file.id) ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </TableCell>
              <TableCell className="file-name-cell px-2 py-1 text-xs break-words whitespace-normal">
                <div className="file-info">
                  <div className="file-icon-container">
                    {getFileIcon(file)}
                  </div>
                  <div className="file-details">
                    <div className="file-name break-words" title={file.originalName}>
                      {file.originalName}
                    </div>
                    <div className="file-meta break-words" title={file.filename}>
                      {file.filename}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="file-type-cell px-2 py-1 text-xs break-words whitespace-normal">
                <span className="file-type-badge whitespace-normal">
                  {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              </TableCell>
              <TableCell className="file-size-cell px-2 py-1 text-xs break-words">
                {formatFileSize(file.fileSize)}
              </TableCell>
              <TableCell className="category-cell px-2 py-1 text-xs break-words whitespace-normal">
                <span className="category-badge whitespace-normal">
                  {getCategoryLabel(file.category)}
                </span>
              </TableCell>
              <TableCell className="entity-cell px-2 py-1 text-xs break-words whitespace-normal">
                <span className="entity-badge whitespace-normal">
                  {getEntityTypeLabel(file.entityType)}
                </span>
              </TableCell>
              <TableCell className="px-2 py-1 text-xs break-words">
                {format(new Date(file.uploadedAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="actions-cell px-2 py-1 text-xs">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(fileService.getDownloadUrl(file.id), '_blank')}
                    className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteFile(file.id)}
                    className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {files.length === 0 && (
        <div className="empty-state">
          <HardDrive className="empty-icon" />
          <h3 className="empty-title">No files found</h3>
          <p className="empty-description">
            {Object.keys(filters).some(key => filters[key as keyof typeof filters]) ?
              'Try adjusting your filters or upload some files.' :
              'Upload your first file to get started.'}
          </p>
          <Button onClick={onUploadClick}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      )}
    </div>
  );
};