import { useState, useEffect, useCallback } from 'react';
import fileService from '@/features/files/services/fileService';
import type { FileMetadata } from '@/features/files/types';
import type { FileFilters } from '../components/FileFilters/FileFilters.types';

export const useFileManagement = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FileFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalFiles, setTotalFiles] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
    setFilters((prev: FileFilters) => ({
      ...prev,
      [key]: value || undefined
    }));
    clearSelection();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    clearSelection();
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
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

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedFiles(new Set(files.map(file => file.id)));
    } else {
      setSelectedFiles(new Set());
    }
  }, [files]);

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
      loadFiles();

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

      return true; // Success
    } catch (error) {
      console.error('Bulk delete failed:', error);
      return false; // Failure
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleFileDeleted = (fileId: string) => {
    loadFiles();

    // Dispatch event to notify other components
    const event = new CustomEvent('file-deleted', {
      detail: { fileId }
    });
    window.dispatchEvent(event);

    // Store in localStorage for cross-tab communication
    localStorage.setItem('file-deleted', JSON.stringify({ fileId, timestamp: Date.now() }));
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      handleFileDeleted(fileId);
      return true;
    } catch (err) {
      console.error('Delete failed:', err);
      return false;
    }
  };

  return {
    // State
    files,
    loading,
    filters,
    currentPage,
    pageSize,
    totalFiles,
    selectedFiles,
    bulkDeleting,

    // Actions
    loadFiles,
    handleFilterChange,
    handlePageChange,
    clearFilters,
    handleFileSelection,
    handleSelectAll,
    clearSelection,
    handleBulkDelete,
    handleDeleteFile,
  };
};