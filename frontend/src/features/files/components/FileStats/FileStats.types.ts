import type { FileMetadata } from '@/features/files/types';

export interface FileStatsProps {
  totalFiles: number;
  files: FileMetadata[];
  selectedFilesCount: number;
}