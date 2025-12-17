import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { fileService } from '../../services';
import type { FileMetadata } from '../../types/file';
import { FileStats } from './file-stats';
import { FileTable } from './file-table';
import { RecentFilesSection } from './recent-files-section';
import { FileFilters as FileFiltersComponent } from './file-filters';
import { Header } from './header';
import { BulkActions } from './bulk-actions';
import { UploadDialog } from './upload-dialog';
import { LoadingSpinner } from './loading-spinner';
import { PaginationSection } from './pagination-section';
import { DeleteConfirmation } from './delete-confirmation';
import { useKeyboardShortcuts } from './use-keyboard-shortcuts';
import { useFileManagement } from './use-file-management';
import './FilesPageEnhanced.scss';

const FilesPageEnhanced: React.FC = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const {
    files,
    loading,
    filters,
    currentPage,
    pageSize,
    totalFiles,
    selectedFiles,
    bulkDeleting,
    handleFilterChange,
    handlePageChange,
    clearFilters,
    handleFileSelection,
    handleSelectAll,
    clearSelection,
    handleBulkDelete,
    handleDeleteFile,
  } = useFileManagement();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSelectAll: () => handleSelectAll(true),
    onClearSelection: clearSelection,
    files
  });

  const handleFileUploaded = (_file: FileMetadata) => {
    // Refresh the current page to show updated results and total count
    // loadFiles is now handled by the hook
    // Don't close dialog automatically - let user decide
  };

  const handleDeleteFileClick = async (fileId: string) => {
    const success = await handleDeleteFile(fileId);
    if (success) {
      setDeletingFileId(null); // Close the dialog after successful deletion
    }
  };

  // Statistics
  if (loading) {
    return (
      <AppLayout>
        <div className="files-page-enhanced">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="files-page-enhanced space-y-2">
        {/* Header */}
        <Header onUploadClick={() => setShowUploadDialog(true)} />

        {/* Statistics Cards */}
        <FileStats
          totalFiles={totalFiles}
          files={files}
          selectedFilesCount={selectedFiles.size}
        />

        {/* Filters */}
        <FileFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedFilesCount={selectedFiles.size}
          onClearSelection={clearSelection}
          onBulkDelete={() => setDeletingFileId('bulk')}
          bulkDeleting={bulkDeleting}
        />

        {/* File Table */}
        <FileTable
          files={files}
          selectedFiles={selectedFiles}
          onFileSelection={handleFileSelection}
          onSelectAll={handleSelectAll}
          onDeleteFile={handleDeleteFileClick}
          filters={filters}
          onUploadClick={() => setShowUploadDialog(true)}
        />


        {/* Pagination */}
        <PaginationSection
          totalFiles={totalFiles}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

        {/* Upload Dialog */}
        <UploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          onUploadSuccess={handleFileUploaded}
          onUploadError={(error) => {
            console.error('Upload error:', error);
          }}
          onUploadStart={(_file) => {}}
          onUploadComplete={(_file, _success) => {}}
          onQueueChange={(_queue) => {}}
        />

        {/* Delete Confirmation */}
        <DeleteConfirmation
          open={!!deletingFileId}
          onOpenChange={(open) => !open && setDeletingFileId(null)}
          onConfirm={() => {
            if (deletingFileId === 'bulk') {
              handleBulkDelete().then(success => {
                if (success) {
                  setDeletingFileId(null);
                }
              });
            } else if (deletingFileId) {
              handleDeleteFileClick(deletingFileId);
            }
          }}
          deletingFileId={deletingFileId}
          selectedFilesCount={selectedFiles.size}
        />
      </div>

      {/* Sidebar */}
      {/* Recent Files Section */}
      <RecentFilesSection
        onFileClick={(file: FileMetadata) => {
          // Open file in new tab for viewing
          window.open(fileService.getDownloadUrl(file.id), '_blank');
        }}
      />
    </AppLayout>
  );
};

export default FilesPageEnhanced;