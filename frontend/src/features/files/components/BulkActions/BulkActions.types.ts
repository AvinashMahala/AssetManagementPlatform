export interface BulkActionsProps {
  selectedFilesCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  bulkDeleting: boolean;
}