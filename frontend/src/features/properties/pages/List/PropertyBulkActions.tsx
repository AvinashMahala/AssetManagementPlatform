import React from 'react';
import { X, Wrench, Trash2, Download } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';

interface PropertyBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkMaintenance: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  bulkActionLoading: boolean;
}

const PropertyBulkActions: React.FC<PropertyBulkActionsProps> = ({
  selectedCount,
  onClearSelection,
  onBulkMaintenance,
  onBulkDelete,
  onBulkExport,
  bulkActionLoading,
}) => {
  return (
    <div className="bulk-actions-toolbar border bg-muted/50 px-4 py-3 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            {selectedCount} propert{selectedCount !== 1 ? 'ies' : 'y'} selected
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
        <div className="bulk-action-buttons flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            className="bulk-action-button bulk-maintenance"
            onClick={onBulkMaintenance}
            disabled={bulkActionLoading}
          >
            {bulkActionLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : (
              <Wrench className="h-4 w-4 mr-2" />
            )}
            Mark as Maintenance
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="bulk-action-button bulk-delete"
            onClick={onBulkDelete}
            disabled={bulkActionLoading}
          >
            {bulkActionLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyBulkActions;