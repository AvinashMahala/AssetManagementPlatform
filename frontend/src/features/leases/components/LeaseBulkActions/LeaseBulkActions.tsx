import React from 'react';
import { Button } from '@/componentDesignLibrary';
import { X, XCircle, Trash2, Download } from 'lucide-react';

interface LeaseBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onTerminate: () => void;
  onDelete: () => void;
  onExport: () => void;
  loading: boolean;
}

export const LeaseBulkActions: React.FC<LeaseBulkActionsProps> = ({
  selectedCount,
  onClearSelection,
  onTerminate,
  onDelete,
  onExport,
  loading
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-actions-toolbar border-t bg-muted/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            {selectedCount} lease{selectedCount !== 1 ? 's' : ''} selected
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
        <div className="flex items-center space-x-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onTerminate}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Terminate Selected
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
        </div>
      </div>
    </div>
  );
};
