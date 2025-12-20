import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import './Header.scss';

interface HeaderProps {
  onUploadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUploadClick }) => {
  return (
    <div className="files-list-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
      <div>
        <h1 className="header-title text-2xl font-bold text-gray-900 dark:text-white">
          File Management <span className="header-subtitle text-base font-normal text-gray-600 dark:text-gray-400">(Centralized document system)</span>
        </h1>
      </div>
      <div className="header-actions flex gap-2">
        <Button
          onClick={onUploadClick}
          className="action-button bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300"
          title="Upload new files"
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </div>
    </div>
  );
};