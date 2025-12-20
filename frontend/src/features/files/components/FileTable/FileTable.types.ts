import type { FileMetadata } from '@/features/files/types';

export interface FileTableProps {
  files: FileMetadata[];
  selectedFiles: Set<string>;
  onFileSelection: (fileId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteFile: (fileId: string) => void;
  filters: Record<string, any>;
  onUploadClick: () => void;
}