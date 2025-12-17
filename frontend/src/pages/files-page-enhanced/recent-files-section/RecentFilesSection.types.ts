import type { FileMetadata } from '../../../types/file';

export interface RecentFilesSectionProps {
  onFileClick: (file: FileMetadata) => void;
}