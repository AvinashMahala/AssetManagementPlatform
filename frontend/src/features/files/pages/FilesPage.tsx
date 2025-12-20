import React, { useState } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { fileService } from '@/services';
import type { FileMetadata } from '@/types/file';
import { FileStats } from '../components/FileStats';
import { FileTable } from '../components/FileTable';
import { RecentFilesSection } from '../components/RecentFilesSection';
import { FileFilters as FileFiltersComponent } from '../components/FileFilters';
import { Header } from '../components/FilesHeader';
import { BulkActions } from '../components/BulkActions';
import { UploadDialog } from '../components/UploadDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PaginationSection } from '../components/PaginationSection';
import { DeleteConfirmation } from '../components/DeleteConfirmation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useFileManagement } from '../hooks/useFileManagement';
import styles from './FilesPage.module.scss';
import '../files-animations.scss';

const FilesPage: React.FC = () => {
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
        <div className={styles.root}>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={`${styles.root} space-y-2`}>
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

export default FilesPage;
