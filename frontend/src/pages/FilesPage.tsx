import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Search, Filter, FileText, Image, Download, Trash2, Plus, CheckSquare, Square, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
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

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      const response = await fileService.listAllFiles({
        ...filters,
        offset: (currentPage - 1) * pageSize,
        limit: pageSize
      });

      if (response.success && response.data) {
        setFiles(response.data.files);
        setTotalFiles(response.data.pagination.total);
      } else {
        setError(response.error?.message || 'Failed to load files');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
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
    if (file.mimeType === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />;
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
    <AppLayout title="Files">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Files</h1>
              <p className="text-gray-600 mt-1">
                Centralized file management for all documents and media
              </p>
            </div>
            <Button onClick={() => setShowUploadDialog(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Upload Files</span>
            </Button>
          </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
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
              </div>

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

        {/* File Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Files ({totalFiles})</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Use Ctrl+A to select all files, Esc to clear selection
                </p>
              </div>
              {selectedFiles.size > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="flex items-center space-x-1"
                    >
                      <X className="h-3 w-3" />
                      <span>Clear</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingFileId('bulk')}
                      disabled={bulkDeleting}
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>{bulkDeleting ? 'Deleting...' : 'Delete Selected'}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={loadFiles}>Retry</Button>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-500 mb-4">
                  {Object.keys(filters).some(key => filters[key as keyof FileFilters]) ?
                    'Try adjusting your filters or upload some files.' :
                    'Upload your first file to get started.'}
                </p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
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
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id} className={selectedFiles.has(file.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                        <TableCell>
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
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm" title={file.originalName}>
                                {file.originalName}
                              </p>
                              <p className="text-xs text-gray-500 truncate" title={file.filename}>
                                {file.filename}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatFileSize(file.fileSize)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryLabel(file.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getEntityTypeLabel(file.entityType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {format(new Date(file.uploadedAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(fileService.getDownloadUrl(file.id), '_blank')}
                              className="h-8 w-8 p-0"
                              title="Download"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingFileId(file.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalFiles > pageSize && (
                  <div className="flex justify-center mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(totalFiles / pageSize)}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={(open) => {
          setShowUploadDialog(open);
          if (!open) {
            setSelectedEntityType(null);
            setSelectedEntity(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-xl">
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
              {(uploadStats.successful > 0 || uploadStats.failed > 0) && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Upload Summary</h3>
                    <div className="flex items-center space-x-4 text-xs">
                      {uploadStats.successful > 0 && (
                        <span className="text-green-600">
                          ✓ {uploadStats.successful} successful
                        </span>
                      )}
                      {uploadStats.failed > 0 && (
                        <span className="text-red-600">
                          ✗ {uploadStats.failed} failed
                        </span>
                      )}
                    </div>
                  </div>

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
              )}
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
      <div className="lg:col-span-1">
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

export default FilesPage;