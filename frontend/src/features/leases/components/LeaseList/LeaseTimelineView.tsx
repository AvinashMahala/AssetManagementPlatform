import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/componentDesignLibrary';
import { Button, Badge } from '@/componentDesignLibrary';
import { User, Home, Calendar, Clock, AlertTriangle, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import type { LeaseListProps } from './LeaseList.types';
import { getStatusVariant, getStatusColor, getDaysUntilExpiry, isExpiringSoon } from '../../utils/leaseUtils';

export const LeaseTimelineView: React.FC<LeaseListProps> = ({
  leases,
  onEdit,
  onView,
  getTenantName,
  getUnitNumber
}) => {
  return (
    <div className="timeline-view-container">
      <div className="space-y-4">
        {leases.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No leases found.
          </div>
        ) : (
          leases.map((lease, index) => {
            const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
            const expiringSoon = isExpiringSoon(lease.endDate);
            const isExpired = lease.status === 'expired' || daysUntilExpiry < 0;
            
            return (
              <div key={lease.id} className="relative">
                {/* Timeline connector */}
                {index !== leases.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" />
                )}
                
                <Card 
                  className="lease-card hover:shadow-lg transition-all duration-200 cursor-pointer relative"
                  onClick={() => onView(lease.id)}
                >
                  {/* Timeline dot */}
                  <div className="timeline-dot absolute left-0 top-6 w-12 flex items-center justify-center">
                    <div className={`h-4 w-4 rounded-full border-2 border-white ${
                      lease.status === 'active' && expiringSoon ? 'bg-orange-500' :
                      lease.status === 'active' ? 'bg-green-500' :
                      isExpired ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                  </div>
                  
                  <CardHeader className="lease-header pl-16">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {getTenantName(lease.tenantId)}
                          <span className="text-muted-foreground">•</span>
                          <Home className="h-4 w-4" />
                          Unit {getUnitNumber(lease)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(lease.startDate), 'MMM dd, yyyy')} - {format(new Date(lease.endDate), 'MMM dd, yyyy')}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(lease.status)} className={getStatusColor(lease)}>
                        {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="lease-content pl-16">
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Monthly Rent:</span>
                        <span className="ml-2 font-bold text-primary">₹{lease.monthlyRent?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Security Deposit:</span>
                        <span className="ml-2 font-medium">₹{lease.securityDeposit?.toLocaleString() || 'N/A'}</span>
                      </div>
                      {lease.status === 'active' && (
                        <div className={`flex items-center gap-1 ${expiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {expiringSoon && lease.status === 'active' && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-amber-800 dark:text-amber-200">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Renewal required soon
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(lease.id);
                            }}
                            className="border-amber-300 hover:bg-amber-100"
                          >
                            Renew
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="lease-actions flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(lease.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(lease.id);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
