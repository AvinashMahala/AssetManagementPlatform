import React from 'react';
import { Pagination } from '../../../components/ui/pagination';
import './PaginationSection.scss';

interface PaginationSectionProps {
  totalFiles: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const PaginationSection: React.FC<PaginationSectionProps> = ({
  totalFiles,
  pageSize,
  currentPage,
  onPageChange
}) => {
  if (totalFiles <= pageSize) return null;

  return (
    <div className="pagination-container">
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalFiles / pageSize)}
        onPageChange={onPageChange}
      />
    </div>
  );
};