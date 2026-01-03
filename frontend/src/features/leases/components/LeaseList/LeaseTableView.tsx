import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/componentDesignLibrary';
import { Button, Badge } from '@/componentDesignLibrary';
import { User, Home, Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { LeaseListProps } from './LeaseList.types';
import { getStatusVariant, getStatusColor, getDaysUntilExpiry, isExpiringSoon } from '../../utils/leaseUtils';
import { useCan } from '@/contexts/RBACContext';

export const LeaseTableView: React.FC<LeaseListProps> = ({
  leases,
  selectedLeases,
  onSelectLease,
  onSelectAll,
  onDelete,
  onEdit,
  onView,
  getTenantName,
  getUnitNumber
}) => {
  const canUpdate = useCan('leases:lease:update');
  const canDelete = useCan('leases:lease:delete');

  return (
    <div className="table-view rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-50 dark:bg-blue-950 hover:bg-blue-50 dark:hover:bg-blue-950">
            <TableHead className="w-12 px-2 py-1 text-xs">
              <input
                type="checkbox"
                checked={selectedLeases.size === leases.length && leases.length > 0}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead className="px-2 py-1 text-xs">Tenant</TableHead>
            <TableHead className="px-2 py-1 text-xs">Unit</TableHead>
            <TableHead className="px-2 py-1 text-xs">Duration</TableHead>
            <TableHead className="px-2 py-1 text-xs">Rent</TableHead>
            <TableHead className="px-2 py-1 text-xs">Status</TableHead>
            <TableHead className="px-2 py-1 text-xs text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                No leases found.
              </TableCell>
            </TableRow>
          ) : (
            leases.map((lease) => {
              const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
              const expiringSoon = isExpiringSoon(lease.endDate);
              
              return (
                <TableRow 
                  key={lease.id} 
                  className="table-row cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20"
                  onClick={() => onView(lease.id)}
                >
                  <TableCell className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedLeases.has(lease.id)}
                      onChange={(e) => onSelectLease(lease.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{getTenantName(lease.tenantId)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>{getUnitNumber(lease)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    <div className="space-y-1">
                      <div className="text-sm">
                        {format(new Date(lease.startDate), 'MMM dd, yyyy')} - {format(new Date(lease.endDate), 'MMM dd, yyyy')}
                      </div>
                      {lease.status === 'active' && expiringSoon && (
                        <div className="flex items-center text-xs text-orange-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Expires in {daysUntilExpiry} days
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs font-medium">₹{lease.monthlyRent?.toLocaleString() || 'N/A'}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    <Badge variant={getStatusVariant(lease.status)} className={getStatusColor(lease)}>
                      {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="View Details"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(lease.id);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
{canUpdate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Edit Lease"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(lease.id);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Delete Lease"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(lease.id, getTenantName(lease.tenantId));
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
