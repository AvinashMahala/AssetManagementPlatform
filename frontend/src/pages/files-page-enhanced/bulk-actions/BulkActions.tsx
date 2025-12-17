import React from 'react';
import { Button } from '../../../components/ui/button';
import { X, Trash2 } from 'lucide-react';
import type { BulkActionsProps } from './BulkActions.types';
import './BulkActions.scss';

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedFilesCount,
  onClearSelection,
  onBulkDelete,
  bulkDeleting
}) => {
  if (selectedFilesCount === 0) return null;

  return (
    <div className="bulk-actions-toolbar">
      <div className="bulk-info">
        <span className="selection-count">
          {selectedFilesCount} file{selectedFilesCount !== 1 ? 's' : ''} selected
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4 mr-2" />
          Clear Selection
        </Button>
      </div>
      <div className="bulk-actions">
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={bulkDeleting}
          className="bulk-btn delete"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
        </Button>
      </div>
    </div>
  );
};