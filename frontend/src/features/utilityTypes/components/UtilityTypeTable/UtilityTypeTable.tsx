import React from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/componentDesignLibrary';
import type { UtilityType } from '../../types';
import styles from './UtilityTypeTable.module.scss';

interface UtilityTypeTableProps {
  data: UtilityType[];
  paginationInfo: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}

export const UtilityTypeTable: React.FC<UtilityTypeTableProps> = ({
  data,
  paginationInfo,
  onPageChange,
  onEdit,
  onDelete,
  deleting,
}) => {
  return (
    <div className={styles['table-container']}>
      <Card className="border">
        <CardContent className="p-0">
          <div className={styles['table-header-fixed']}>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '20%' }}>Name</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '20%' }}>Key</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '15%' }}>Unit</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100" style={{ width: '30%' }}>Metadata</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-semibold text-blue-900 dark:text-blue-100 text-right" style={{ width: '15%' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>

          <div className={styles['table-body-scrollable']}>
            <Table>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                      No utility types found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="py-2 px-2 text-sm font-medium">{item.name}</TableCell>
                      <TableCell className="py-2 px-2 text-sm text-gray-500">{item.key}</TableCell>
                      <TableCell className="py-2 px-2 text-sm text-gray-500">{item.unitOfMeasure || '-'}</TableCell>
                      <TableCell className="py-2 px-2 text-sm text-gray-500 truncate" title={item.metadata}>
                        {item.metadata || '{}'}
                      </TableCell>
                      <TableCell className="py-2 px-2 text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item.id)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id)}
                            disabled={deleting}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {paginationInfo && paginationInfo.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="text-xs text-gray-500">
                Page {paginationInfo.page} of {paginationInfo.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(paginationInfo.page - 1)}
                  disabled={!paginationInfo.hasPrev}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(paginationInfo.page + 1)}
                  disabled={!paginationInfo.hasNext}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
