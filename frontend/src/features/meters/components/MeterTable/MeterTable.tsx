import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Power, PowerOff, Plus, ChevronLeft, ChevronRight, Zap, Droplets, Flame, Activity } from 'lucide-react';
import { MeterType } from '@/features/meters/types';
import { Card, CardContent } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/componentDesignLibrary';
import styles from './MeterTable.module.scss';

interface MeterTableProps {
  meters: any[]; // Replace 'any' with proper Meter type if available
  paginationInfo: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  updatingStatus: boolean;
  deleting: boolean;
  searchTerm?: string;
  filters?: {
    meterType?: string;
    status?: string;
  };
}

export const MeterTable: React.FC<MeterTableProps> = ({
  meters,
  paginationInfo,
  onPageChange,
  onDelete,
  onToggleStatus,
  updatingStatus,
  deleting,
  searchTerm,
  filters,
}) => {
  const navigate = useNavigate();

  const getMeterTypeLabel = (type: MeterType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getMeterTypeColor = (type: MeterType) => {
    switch (type) {
      case MeterType.ELECTRICITY:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case MeterType.WATER:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case MeterType.GAS:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMeterTypeIcon = (type: MeterType) => {
    switch (type) {
      case MeterType.ELECTRICITY:
        return <Zap className="h-4 w-4" />;
      case MeterType.WATER:
        return <Droplets className="h-4 w-4" />;
      case MeterType.GAS:
        return <Flame className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div data-section="table" className={styles['table-container']}>
      <Card className={`${styles['table-card']} border`}>
        <CardContent className="p-0">
          {/* Fixed Header */}
          <div className={styles['table-header-fixed']}>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '15%' }}>Meter Name</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '12%' }}>Type</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '13%' }}>Meter Number</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '10%' }}>Cost/Unit</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '10%' }}>Fixed Charge</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '10%' }}>Status</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '20%' }}>Remarks</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100 text-right" style={{ width: '10%' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>

          {/* Scrollable Body */}
          <div className={styles['table-body-scrollable']}>
            <Table>
              <TableBody>
                {meters.length > 0 ? (
                  meters.map((meter, index) => (
                    <TableRow key={meter.id} className={`hover:bg-orange-50 dark:hover:bg-orange-950/10 transition-colors ${meter.isActive ? 'bg-green-50/30 dark:bg-green-950/10' : ''}`} style={{ '--row-index': index } as React.CSSProperties}>
                      <TableCell className="px-2 py-1 text-xs font-medium">
                        <div className={styles['meter-name-cell']}>
                          <span className={styles['meter-name']}>{meter.meterName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-1 text-xs">
                        <Badge className={`${styles['meter-type-badge']} text-xs px-1.5 py-0 ${getMeterTypeColor(meter.meterType)}`}>
                          {getMeterTypeIcon(meter.meterType)}
                          <span className="ml-1">{getMeterTypeLabel(meter.meterType)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 py-1 text-xs">
                        <span className={`${styles['meter-number']} font-mono`}>{meter.meterNumber || 'N/A'}</span>
                      </TableCell>
                      <TableCell className="px-2 py-1 text-xs">
                        <span className={`${styles['cost-value']} font-semibold`}>₹{meter.costPerUnit}</span>
                      </TableCell>
                      <TableCell className="px-2 py-1 text-xs">
                        <span className={styles['fixed-charge']}>{meter.fixedCharge ? `₹${meter.fixedCharge}` : 'None'}</span>
                      </TableCell>
                      <TableCell className="px-2 py-1 text-xs">
                        <Badge className={`${styles['status-badge']} text-xs px-1.5 py-0 ${meter.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {meter.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 py-1 text-xs" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }} title={meter.remarks}>
                        <span className={styles['remarks-text']}>{meter.remarks || '-'}</span>
                      </TableCell>
                      <TableCell className="px-2 py-1 text-xs text-right">
                        <div className={`${styles['table-actions']} flex justify-end gap-2`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={styles['table-action-button']}
                            onClick={() => navigate(`/meters/${meter.id}`)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={styles['table-action-button']}
                            onClick={() => onToggleStatus(meter.id, meter.isActive)}
                            disabled={updatingStatus}
                            title={meter.isActive ? 'Deactivate meter' : 'Activate meter'}
                          >
                            {meter.isActive ? (
                              <PowerOff className="h-4 w-4 text-red-600" />
                            ) : (
                              <Power className="h-4 w-4 text-green-600" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={styles['table-action-button']}
                            onClick={() => navigate(`/meters/${meter.id}/edit`)}
                            title="Edit meter"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={`${styles['table-action-button']} ${styles['delete-button']}`}
                            onClick={() => onDelete(meter.id)}
                            disabled={deleting}
                            title="Delete meter"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className={`${styles['empty-table-cell']} h-32 text-center`}>
                      <div className={styles['empty-state']}>
                        <div className={styles['empty-icon']}>⚡</div>
                        <h3 className={styles['empty-title']}>No meters found</h3>
                        <p className={styles['empty-description']}>
                          {searchTerm || filters?.meterType || filters?.status
                            ? 'Try adjusting your filters'
                            : 'Get started by adding your first utility meter'}
                        </p>
                        {!searchTerm && !filters?.meterType && !filters?.status && (
                          <Button className={styles['empty-action-button']} onClick={() => navigate('/meters/create-tabbed')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Meter
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {paginationInfo && paginationInfo.totalPages > 1 && (
            <div className={`${styles['pagination-container']} flex justify-between items-center px-4 py-2 border-t`}>
              <div className={`${styles['pagination-info']} text-sm text-muted-foreground`}>
                Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1} to{' '}
                {Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of{' '}
                {paginationInfo.total} meters
              </div>

              <div className={`${styles['pagination-controls']} flex items-center gap-2`}>
                <Button
                  variant="outline"
                  size="sm"
                  className={styles['pagination-button']}
                  onClick={() => onPageChange(paginationInfo.page - 1)}
                  disabled={!paginationInfo.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className={`${styles['pagination-numbers']} flex items-center gap-1`}>
                  {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(
                      paginationInfo.totalPages - 4,
                      paginationInfo.page - 2
                    )) + i;

                    if (pageNum > paginationInfo.totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === paginationInfo.page ? "default" : "outline"}
                        size="sm"
                        className={styles['pagination-number']}
                        onClick={() => onPageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className={styles['pagination-button']}
                  onClick={() => onPageChange(paginationInfo.page + 1)}
                  disabled={!paginationInfo.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
