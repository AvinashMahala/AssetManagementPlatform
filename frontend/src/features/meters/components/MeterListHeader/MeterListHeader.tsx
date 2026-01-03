import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import styles from './MeterListHeader.module.scss';
import { useCan } from '@/contexts/RBACContext';

interface MeterListHeaderProps {
  onAddClick: () => void;
}

export const MeterListHeader: React.FC<MeterListHeaderProps> = ({ onAddClick }) => {
  return (
    <div
      data-section="header"
      className={`${styles['meter-list-header']} flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2`}
    >
      <div>
        <h1 className={`${styles['header-title']} text-2xl font-bold text-gray-900 dark:text-white`}>
          Meters <span className={`${styles['header-subtitle']} text-base font-normal text-gray-600 dark:text-gray-400`}>(Manage utility meters)</span>
        </h1>
      </div>
      <div className="header-actions flex gap-2">
        {useCan('meters:meter:create') && (
          <Button
            className="action-button bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={onAddClick}
            title="Step-by-step guided form with progress tracking"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Meter
          </Button>
        )}
      </div>
    </div>
  );
};
