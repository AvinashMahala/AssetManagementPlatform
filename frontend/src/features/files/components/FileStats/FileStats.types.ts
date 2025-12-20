import type { FileMetadata } from '@/types/file';

export interface FileStatsProps {
  totalFiles: number;
  files: FileMetadata[];
  selectedFilesCount: number;
}