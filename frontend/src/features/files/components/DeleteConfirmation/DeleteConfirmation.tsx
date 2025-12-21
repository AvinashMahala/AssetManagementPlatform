import React from 'react';
import { ConfirmDialog } from '@/componentDesignLibrary';
import './DeleteConfirmation.scss';

interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deletingFileId: string | null;
  selectedFilesCount: number;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  open,
  onOpenChange,
  onConfirm,
  deletingFileId,
  selectedFilesCount
}) => {
  if (!deletingFileId) return null;

  const isBulk = deletingFileId === 'bulk';

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={isBulk ? "Delete Selected Files" : "Delete File"}
      description={
        isBulk
          ? `Are you sure you want to delete ${selectedFilesCount} selected file${selectedFilesCount !== 1 ? 's' : ''}? This action cannot be undone.`
          : "Are you sure you want to delete this file? This action cannot be undone."
      }
      variant="destructive"
      confirmLabel={isBulk ? "Delete Files" : "Delete"}
    />
  );
};