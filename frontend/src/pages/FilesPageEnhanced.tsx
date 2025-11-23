import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, Search, Filter, FileText, Image, Download, Trash2, Plus, CheckSquare, Square, X, FolderOpen, HardDrive, FileImage, FileVideo, FileAudio, Archive } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Pagination } from '../components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileUpload } from '../components/files';
import RecentFilesWidget from '../components/files/RecentFilesWidget';
import { ConfirmDialog } from '../componentDesignLibrary';
import { AppLayout } from '../components/layout/AppLayout';
import { fileService } from '../services';
import { propertyService } from '../services/propertyService';
import { tenantService } from '../services/tenantService';
import { unitService } from '../services/unitService';
import type { FileMetadata } from '../types/file';
import { format } from 'date-fns';
import './FilesPageEnhanced.scss';

interface FileFilters {
  entityType?: string;
  category?: string;
  search?: string;
}

interface EntityOption {
  id: string;
  name: string;
  type: 'property' | 'unit' | 'tenant';
}

const EntitySelector: React.FC<{
  entityType: 'property' | 'unit' | 'tenant';
  onEntitySelect: (entity: EntityOption | null) => void;
  selectedEntity: EntityOption | null;
}> = ({ entityType, onEntitySelect, selectedEntity }) => {
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEntities = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      switch (entityType) {
        case 'property':
          result = await propertyService.getAll({ limit: 50 });
          if (result.success && result.data) {
            setEntities(result.data.map(p => ({
              id: p.id,
              name: `${p.name} - ${p.address.city}`,
              type: 'property'
            })));
          }
          break;
        case 'unit':
          result = await unitService.getAll();
          if (result.success && result.data) {
            setEntities(result.data.map(u => ({
              id: u.id,
              name: `${u.unitNumber}${u.unitName ? ` (${u.unitName})` : ''}`,
              type: 'unit'
            })));
          }
          break;
        case 'tenant':
          result = await tenantService.getAll();
          if (result.success && result.data) {
            setEntities(result.data.map(t => ({
              id: t.id,
              name: `${t.firstName} ${t.lastName} - ${t.email}`,
              type: 'tenant'
            })));
          }
          break;
      }
    } catch (error) {
      console.error('Failed to load entities:', error);
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
      </label>
      <Select
        value={selectedEntity?.id || ''}
        onValueChange={(value) => {
          const entity = entities.find(e => e.id === value);
          onEntitySelect(entity || null);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${entityType}`} />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-900 border shadow-lg max-h-60">
          <div className="p-2">
            <Input
              placeholder={`Search ${entityType}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : filteredEntities.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No {entityType}s found</div>
          ) : (
            filteredEntities.map((entity) => (
              <SelectItem key={entity.id} value={entity.id}>
                {entity.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

const FilesPageEnhanced: React.FC = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FileFilters>({});
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<'property' | 'unit' | 'tenant' | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityOption | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalFiles, setTotalFiles] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0
  });
  const [keepDialogOpen, setKeepDialogOpen] = useState(true);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fileService.listAllFiles({
        ...filters,
        offset: (currentPage - 1) * pageSize,
        limit: pageSize
      });

      if (response.success && response.data) {
        setFiles(response.data.files);
        setTotalFiles(response.data.pagination.total);
      } else {
        console.error('Failed to load files:', response.error?.message);
      }
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFilterChange = (key: keyof FileFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
    clearSelection(); // Clear selection when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    clearSelection(); // Clear selection when page changes
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handleFileSelection = (fileId: string, checked: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(fileId);
      } else {
        newSet.delete(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(new Set(files.map(file => file.id)));
    } else {
      setSelectedFiles(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;

    try {
      setBulkDeleting(true);
      const deletePromises = Array.from(selectedFiles).map(fileId =>
        fileService.deleteFile(fileId)
      );

      await Promise.all(deletePromises);
      clearSelection();
      loadFiles(); // Refresh the file list

      // Dispatch events for each deleted file
      Array.from(selectedFiles).forEach(fileId => {
        const event = new CustomEvent('file-deleted', {
          detail: { fileId }
        });
        window.dispatchEvent(event);
      });

      // Store bulk deletion info in localStorage
      localStorage.setItem('file-deleted', JSON.stringify({
        fileIds: Array.from(selectedFiles),
        timestamp: Date.now(),
        bulk: true
      }));

      setDeletingFileId(null); // Close the dialog after successful bulk deletion
    } catch (error) {
      console.error('Bulk delete failed:', error);
      // Keep dialog open on error so user can retry or cancel
    } finally {
      setBulkDeleting(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'a') {
          event.preventDefault();
          handleSelectAll(true);
        }
      }
      if (event.key === 'Escape') {
        clearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [files]);

  const handleFileUploaded = (_file: FileMetadata) => {
    // Refresh the current page to show updated results and total count
    loadFiles();
    // Update upload stats
    setUploadStats(prev => ({
      ...prev,
      successful: prev.successful + 1
    }));
    // Don't close dialog automatically - let user decide
  };

  const handleFileDeleted = (fileId: string) => {
    // Refresh the current page to show updated results and total count
    loadFiles();

    // Dispatch event to notify other components (like PropertyFileGallery) that a file was deleted
    const event = new CustomEvent('file-deleted', {
      detail: { fileId }
    });
    window.dispatchEvent(event);

    // Also store in localStorage for cross-tab communication
    localStorage.setItem('file-deleted', JSON.stringify({ fileId, timestamp: Date.now() }));
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      handleFileDeleted(fileId);
      setDeletingFileId(null); // Close the dialog after successful deletion
    } catch (err) {
      console.error('Delete failed:', err);
      // Keep dialog open on error so user can retry or cancel
    }
  };

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

  // Statistics
  const stats = useMemo(() => {
    const total = totalFiles;
    const images = files.filter(f => f.mimeType.startsWith('image/')).length;
    const documents = files.filter(f => f.mimeType === 'application/pdf' || f.mimeType.includes('document')).length;
    const totalSize = files.reduce((sum, f) => sum + f.fileSize, 0);

    return { total, images, documents, totalSize };
  }, [totalFiles, files]);

  if (loading) {
    return (
      <AppLayout>
        <div className="files-page-enhanced">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="files-page-enhanced space-y-2">
        {/* Header */}
        <div className="header-section flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h1 className="header-title text-2xl font-bold text-gray-900 dark:text-white">
              File Management <span className="header-subtitle text-base font-normal text-gray-600 dark:text-gray-400">(Centralized document system)</span>
            </h1>
          </div>
          <div className="header-actions flex gap-2">
            <Button onClick={() => setShowUploadDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
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
              <div className="stat-value text-2xl font-bold">{selectedFiles.size}</div>
              <p className="stat-subtext text-xs text-muted-foreground mt-1">For bulk actions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="filters-section">
          <CardHeader className="filters-header">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="filters-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="search-container">
                <Search className="search-icon" />
                <Input
                  placeholder="Search files..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="search-input"
                />
              </div>

              <Select
                value={filters.entityType || ''}
                onValueChange={(value) => handleFilterChange('entityType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border shadow-lg">
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="unit">Unit</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedFiles.size > 0 && (
          <div className="bulk-actions-toolbar">
            <div className="bulk-info">
              <span className="selection-count">
                {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
            <div className="bulk-actions">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeletingFileId('bulk')}
                disabled={bulkDeleting}
                className="bulk-btn delete"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
              </Button>
            </div>
          </div>
        )}

        {/* File Table */}
        <div className="table-view">
          <Table>
            <TableHeader className="table-header bg-blue-50 dark:bg-blue-950">
              <TableRow>
                <TableHead className="w-12 px-2 py-1 text-xs">
                  <button
                    onClick={() => handleSelectAll(selectedFiles.size !== files.length)}
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
                <TableHead className="px-2 py-1 text-xs">Name</TableHead>
                <TableHead className="px-2 py-1 text-xs">Type</TableHead>
                <TableHead className="px-2 py-1 text-xs">Size</TableHead>
                <TableHead className="px-2 py-1 text-xs">Category</TableHead>
                <TableHead className="px-2 py-1 text-xs">Entity</TableHead>
                <TableHead className="px-2 py-1 text-xs">Uploaded</TableHead>
                <TableHead className="w-24 px-2 py-1 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id} className="table-row hover:bg-orange-50 dark:hover:bg-orange-950/20">
                  <TableCell className="px-2 py-1">
                    <button
                      onClick={() => handleFileSelection(file.id, !selectedFiles.has(file.id))}
                      className="flex items-center justify-center w-5 h-5 hover:bg-gray-100 rounded"
                    >
                      {selectedFiles.has(file.id) ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="file-name-cell px-2 py-1 text-xs">
                    <div className="file-info">
                      <div className="file-icon-container">
                        {getFileIcon(file)}
                      </div>
                      <div className="file-details">
                        <div className="file-name" title={file.originalName}>
                          {file.originalName}
                        </div>
                        <div className="file-meta" title={file.filename}>
                          {file.filename}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="file-type-cell px-2 py-1 text-xs">
                    <span className="file-type-badge">
                      {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                  </TableCell>
                  <TableCell className="file-size-cell px-2 py-1 text-xs">
                    {formatFileSize(file.fileSize)}
                  </TableCell>
                  <TableCell className="category-cell px-2 py-1 text-xs">
                    <span className="category-badge">
                      {getCategoryLabel(file.category)}
                    </span>
                  </TableCell>
                  <TableCell className="entity-cell px-2 py-1 text-xs">
                    <span className="entity-badge">
                      {getEntityTypeLabel(file.entityType)}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
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
                        onClick={() => setDeletingFileId(file.id)}
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
                {Object.keys(filters).some(key => filters[key as keyof FileFilters]) ?
                  'Try adjusting your filters or upload some files.' :
                  'Upload your first file to get started.'}
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalFiles > pageSize && (
          <div className="pagination-container">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalFiles / pageSize)}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={(open) => {
          setShowUploadDialog(open);
          if (!open) {
            setSelectedEntityType(null);
            setSelectedEntity(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-xl upload-dialog">
            <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 pb-4 border-b">
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-gray-600">
                Select the entity type and ID to upload files to, or choose to upload general files.
              </p>

              <Tabs defaultValue="entity" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="entity">Upload to Entity</TabsTrigger>
                  <TabsTrigger value="general">General Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="entity" className="space-y-4 bg-white dark:bg-gray-900">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entity Type
                      </label>
                      <Select onValueChange={(value) => {
                        setSelectedEntityType(value as 'property' | 'unit' | 'tenant');
                        setSelectedEntity(null); // Clear selection when type changes
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border shadow-lg">
                          <SelectItem value="property">Property</SelectItem>
                          <SelectItem value="unit">Unit</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedEntityType && (
                      <EntitySelector
                        entityType={selectedEntityType}
                        onEntitySelect={setSelectedEntity}
                        selectedEntity={selectedEntity}
                      />
                    )}
                  </div>

                  {selectedEntity && (
                    <FileUpload
                      entityType={selectedEntity.type}
                      entityId={selectedEntity.id}
                      onUploadSuccess={handleFileUploaded}
                      onUploadError={(error) => {
                        console.error('Upload error:', error);
                        setUploadStats(prev => ({
                          ...prev,
                          failed: prev.failed + 1
                        }));
                      }}
                      onUploadStart={(_file) => {
                        setUploadStats(prev => ({
                          ...prev,
                          total: prev.total + 1,
                          pending: prev.pending + 1
                        }));
                      }}
                      onUploadComplete={(_file, success) => {
                        setUploadStats(prev => ({
                          ...prev,
                          pending: Math.max(0, prev.pending - 1),
                          successful: success ? prev.successful + 1 : prev.successful,
                          failed: !success ? prev.failed + 1 : prev.failed
                        }));
                      }}
                      onQueueChange={(queue) => {
                        const pending = queue.filter(u => u.status === 'pending').length;
                        setUploadStats(prev => ({
                          ...prev,
                          pending
                        }));
                      }}
                      autoStart={false}
                      showQueueControls={true}
                    />
                  )}
                </TabsContent>

                <TabsContent value="general" className="space-y-4 bg-white dark:bg-gray-900">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload general files that are not associated with specific properties, units, or tenants.
                      </p>
                    </div>

                    <FileUpload
                      category="general"
                      onUploadSuccess={handleFileUploaded}
                      onUploadError={(error) => {
                        console.error('Upload error:', error);
                        setUploadStats(prev => ({
                          ...prev,
                          failed: prev.failed + 1
                        }));
                      }}
                      onUploadStart={(_file) => {
                        setUploadStats(prev => ({
                          ...prev,
                          total: prev.total + 1,
                          pending: prev.pending + 1
                        }));
                      }}
                      onUploadComplete={(_file, success) => {
                        setUploadStats(prev => ({
                          ...prev,
                          pending: Math.max(0, prev.pending - 1),
                          successful: success ? prev.successful + 1 : prev.successful,
                          failed: !success ? prev.failed + 1 : prev.failed
                        }));
                      }}
                      onQueueChange={(queue) => {
                        const pending = queue.filter(u => u.status === 'pending').length;
                        setUploadStats(prev => ({
                          ...prev,
                          pending
                        }));
                      }}
                      autoStart={false}
                      showQueueControls={true}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Upload Statistics & Controls */}
              {(uploadStats.successful > 0 || uploadStats.failed > 0 || uploadStats.pending > 0) && (
                <div className="upload-stats">
                  <div className="stat-item success">
                    <span>Successful uploads</span>
                    <span>{uploadStats.successful}</span>
                  </div>
                  {uploadStats.failed > 0 && (
                    <div className="stat-item error">
                      <span>Failed uploads</span>
                      <span>{uploadStats.failed}</span>
                    </div>
                  )}
                  {uploadStats.pending > 0 && (
                    <div className="stat-item pending">
                      <span>Pending uploads</span>
                      <span>{uploadStats.pending}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={keepDialogOpen}
                      onChange={(e) => setKeepDialogOpen(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span>Keep dialog open after upload</span>
                  </label>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadStats({ total: 0, successful: 0, failed: 0, pending: 0 });
                      setSelectedEntityType(null);
                      setSelectedEntity(null);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowUploadDialog(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        {deletingFileId && (
          <ConfirmDialog
            open={!!deletingFileId}
            onOpenChange={(open) => !open && setDeletingFileId(null)}
            onConfirm={() => {
              if (deletingFileId === 'bulk') {
                handleBulkDelete();
              } else {
                handleDeleteFile(deletingFileId);
              }
            }}
            title={deletingFileId === 'bulk' ? "Delete Selected Files" : "Delete File"}
            description={
              deletingFileId === 'bulk'
                ? `Are you sure you want to delete ${selectedFiles.size} selected file${selectedFiles.size !== 1 ? 's' : ''}? This action cannot be undone.`
                : "Are you sure you want to delete this file? This action cannot be undone."
            }
            variant="destructive"
            confirmLabel={deletingFileId === 'bulk' ? "Delete Files" : "Delete"}
          />
        )}
      </div>

      {/* Sidebar */}
      <div className="sidebar-section">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Recent Files</h3>
          <p className="sidebar-description">Quick access to recently uploaded files</p>
        </div>
        <div className="sidebar-content">
          <RecentFilesWidget
            limit={5}
            onFileClick={(file) => {
              // Open file in new tab for viewing
              window.open(fileService.getDownloadUrl(file.id), '_blank');
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default FilesPageEnhanced;