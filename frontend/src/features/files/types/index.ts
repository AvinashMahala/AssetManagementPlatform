import type { EntityOption } from '../components/EntitySelector';

export interface UploadStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
}

export interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEntityType: 'property' | 'unit' | 'tenant' | null;
  selectedEntity: EntityOption | null;
  onEntityTypeChange: (type: 'property' | 'unit' | 'tenant' | null) => void;
  onEntitySelect: (entity: EntityOption | null) => void;
  uploadStats: UploadStats;
  keepDialogOpen: boolean;
  onKeepDialogOpenChange: (keep: boolean) => void;
  onUpload: (files: File[], entityType?: string | null, entity?: EntityOption | null) => void;
}
