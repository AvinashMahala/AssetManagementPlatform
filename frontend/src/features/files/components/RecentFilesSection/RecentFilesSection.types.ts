import type { FileMetadata } from '@/features/files/types';

export interface RecentFilesSectionProps {
  onFileClick: (file: FileMetadata) => void;
}