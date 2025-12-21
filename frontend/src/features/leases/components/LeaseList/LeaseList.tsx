import React from 'react';
import type { LeaseListProps } from './LeaseList.types';
import { LeaseTableView } from './LeaseTableView';
import { LeaseTimelineView } from './LeaseTimelineView';

export const LeaseList: React.FC<LeaseListProps> = (props) => {
  const { viewMode, loading } = props;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (viewMode === 'table') {
    return <LeaseTableView {...props} />;
  }

  return <LeaseTimelineView {...props} />;
};
