import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, CheckCircle2, XCircle, Clock, AlertTriangle, Calendar, Eye, Edit, User, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useLeases } from '../../hooks/useLeases';
import { useTenants } from '../../hooks/useTenants';
import { useUnits } from '../../hooks/useUnits';
import { AppLayout } from '../../components/layout';
import { format } from 'date-fns';

const LeaseListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('timeline');
  const { leases, loading } = useLeases();
  const { tenants } = useTenants();
  const { units } = useUnits();

  // Helper functions
  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
  };

  const getUnitNumber = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit?.unitNumber || 'Unknown';
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpiringSoon = (endDate: string) => {
    const days = getDaysUntilExpiry(endDate);
    return days > 0 && days <= 30;
  };

  const filteredLeases = Array.isArray(leases) ? leases.filter(l => {
    const tenantName = getTenantName(l.tenantId);
    const unitNumber = getUnitNumber(l.unitId);
    const matchesSearch = `${tenantName} ${unitNumber}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const activeCount = Array.isArray(leases) ? leases.filter(l => l.status === 'active').length : 0;
  const expiredCount = Array.isArray(leases) ? leases.filter(l => l.status === 'expired').length : 0;
  const expiringCount = Array.isArray(leases) ? leases.filter(l => l.status === 'active' && isExpiringSoon(l.endDate)).length : 0;

  const stats = [
    { label: 'Total Leases', value: (Array.isArray(leases) ? leases.length : 0).toString(), icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active', value: activeCount.toString(), icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Expiring Soon', value: expiringCount.toString(), icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Expired', value: expiredCount.toString(), icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'pending', label: 'Pending' },
    { value: 'terminated', label: 'Terminated' },
  ];

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'pending': return 'secondary';
      case 'terminated': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (lease: any): string => {
    if (lease.status === 'active' && isExpiringSoon(lease.endDate)) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
    switch (lease.status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'terminated': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Sort leases by end date for timeline view
  const sortedLeases = useMemo(() => {
    return [...filteredLeases].sort((a, b) => {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });
  }, [filteredLeases]);

  return (
    <AppLayout title="Leases">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lease Management</h1>
            <p className="text-muted-foreground">Manage lease agreements and track renewals</p>
          </div>
          <Button onClick={() => navigate('/leases/create')} size="lg">
            <Plus className="mr-2 h-4 w-4" /> Create Lease
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Expiring Soon Alert */}
        {expiringCount > 0 && (
          <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-900 dark:text-amber-300">
                  {expiringCount} Lease(s) Expiring Soon
                </CardTitle>
              </div>
              <CardDescription className="text-amber-800 dark:text-amber-200">
                Review and renew leases expiring within the next 30 days
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by tenant name, unit number..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-r-none"
                  >
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('timeline')}
                    className="rounded-l-none"
                  >
                    Timeline
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : viewMode === 'table' ? (
              /* Table View */
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          {search ? 'No leases found matching your search.' : 'No leases found. Click "Create Lease" to create one.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLeases.map((lease) => {
                        const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
                        const expiringSoon = isExpiringSoon(lease.endDate);
                        
                        return (
                          <TableRow 
                            key={lease.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/leases/${lease.id}`)}
                          >
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{getTenantName(lease.tenantId)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                <span>{getUnitNumber(lease.unitId)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
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
                            <TableCell className="font-medium">₹{lease.monthlyRent?.toLocaleString() || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(lease.status)} className={getStatusColor(lease)}>
                                {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/leases/${lease.id}`);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/leases/${lease.id}/edit`);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Timeline View */
              <div className="space-y-4">
                {sortedLeases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {search ? 'No leases found matching your search.' : 'No leases found. Click "Create Lease" to create one.'}
                  </div>
                ) : (
                  sortedLeases.map((lease, index) => {
                    const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
                    const expiringSoon = isExpiringSoon(lease.endDate);
                    const isExpired = lease.status === 'expired' || daysUntilExpiry < 0;
                    
                    return (
                      <div key={lease.id} className="relative">
                        {/* Timeline connector */}
                        {index !== sortedLeases.length - 1 && (
                          <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" />
                        )}
                        
                        <Card 
                          className="hover:shadow-lg transition-all duration-200 cursor-pointer relative"
                          onClick={() => navigate(`/leases/${lease.id}`)}
                        >
                          {/* Timeline dot */}
                          <div className={`absolute left-0 top-6 w-12 flex items-center justify-center`}>
                            <div className={`h-4 w-4 rounded-full border-2 border-white ${
                              lease.status === 'active' && expiringSoon ? 'bg-orange-500' :
                              lease.status === 'active' ? 'bg-green-500' :
                              isExpired ? 'bg-red-500' :
                              'bg-gray-400'
                            }`} />
                          </div>
                          
                          <CardHeader className="pl-16">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  {getTenantName(lease.tenantId)}
                                  <span className="text-muted-foreground">•</span>
                                  <Home className="h-4 w-4" />
                                  Unit {getUnitNumber(lease.unitId)}
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
                          <CardContent className="pl-16">
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
                                      // Navigate to renewal or edit
                                      navigate(`/leases/${lease.id}/edit`);
                                    }}
                                    className="border-amber-300 hover:bg-amber-100"
                                  >
                                    Renew
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/leases/${lease.id}`);
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
                                  navigate(`/leases/${lease.id}/edit`);
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LeaseListPageEnhanced;
