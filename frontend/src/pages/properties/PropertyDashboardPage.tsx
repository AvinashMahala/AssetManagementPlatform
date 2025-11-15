import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, DollarSign, TrendingUp, Home, Receipt } from 'lucide-react';
import { useProperty, useUnits, useLeases, usePayments } from '../../hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui';
import { getErrorMessage } from '../../types/api';

export const PropertyDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: property, loading: propertyLoading, error: propertyError } = useProperty(id!);
  const { units, loading: unitsLoading } = useUnits(id);
  const { leases } = useLeases();
  const { payments } = usePayments();

  // Filter leases for this property's units
  const propertyUnitIds = units.map(u => u.id);
  const propertyLeases = leases.filter(l => propertyUnitIds.includes(l.unitId));
  
  // Filter payments for this property's leases
  const propertyLeaseIds = propertyLeases.map(l => l.id);
  const propertyPayments = payments.filter(p => propertyLeaseIds.includes(p.leaseId));

  // Calculate metrics
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'occupied').length;
  const availableUnits = units.filter(u => u.status === 'available').length;
  const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;
  
  const activeLeases = propertyLeases.filter(l => l.status === 'active').length;
  const totalMonthlyRent = propertyLeases
    .filter(l => l.status === 'active')
    .reduce((sum, lease) => sum + lease.monthlyRent, 0);
  
  const paidPayments = propertyPayments.filter(p => p.status === 'paid');
  const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
  
  const pendingPayments = propertyPayments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'default';
      case 'under_maintenance': return 'warning';
      case 'reserved': return 'secondary';
      default: return 'outline';
    }
  };

  if (propertyLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (propertyError || !property) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{getErrorMessage(propertyError) || 'Property not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
            <p className="text-muted-foreground">
              {property.address.street}, {property.address.city}, {property.address.state}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/properties/${id}/rent-collection`)}>
            <Receipt className="h-4 w-4 mr-2" />
            Rent Collection
          </Button>
          <Button variant="outline" onClick={() => navigate(`/properties/${id}/edit`)}>
            Edit Property
          </Button>
          <Button onClick={() => navigate(`/units/create?propertyId=${id}`)}>
            Add Unit
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {occupiedUnits} occupied, {availableUnits} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {occupiedUnits} out of {totalUnits} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyRent)}</div>
            <p className="text-xs text-muted-foreground">
              From {activeLeases} active leases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {paidPayments.length} payments received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="leases">Leases</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Units Tab */}
        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Units in this Property</CardTitle>
                <Button size="sm" onClick={() => navigate(`/units/create?propertyId=${id}`)}>
                  Add Unit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {unitsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : units.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No units yet</h3>
                  <p className="text-muted-foreground mb-4">Add units to this property to get started.</p>
                  <Button onClick={() => navigate(`/units/create?propertyId=${id}`)}>Add First Unit</Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Rent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {units.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{unit.unitType.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(unit.monthlyRent)}/mo</TableCell>
                          <TableCell>
                            <Badge variant={getUnitStatusColor(unit.status)}>
                              {unit.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/units/${unit.id}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leases Tab */}
        <TabsContent value="leases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Leases</CardTitle>
              <CardDescription>Lease agreements for units in this property</CardDescription>
            </CardHeader>
            <CardContent>
              {propertyLeases.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No leases</h3>
                  <p className="text-muted-foreground">No lease agreements for this property yet.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit</TableHead>
                        <TableHead>Rent</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {propertyLeases.map((lease) => {
                        const unit = units.find(u => u.id === lease.unitId);
                        return (
                          <TableRow key={lease.id}>
                            <TableCell className="font-medium">
                              {unit ? `Unit ${unit.unitNumber}` : 'Unknown'}
                            </TableCell>
                            <TableCell>{formatCurrency(lease.monthlyRent)}/mo</TableCell>
                            <TableCell>{new Date(lease.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(lease.endDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={lease.status === 'active' ? 'success' : 'secondary'}>
                                {lease.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/leases/${lease.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All rent payments for this property</CardDescription>
            </CardHeader>
            <CardContent>
              {propertyPayments.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No payments</h3>
                  <p className="text-muted-foreground">No payment records for this property yet.</p>
                </div>
              ) : (
                <>
                  {/* Payment Summary */}
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {propertyPayments.length > 0
                            ? ((paidPayments.length / propertyPayments.length) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Paid Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {propertyPayments.slice(0, 10).map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>
                              {payment.paidDate
                                ? new Date(payment.paidDate).toLocaleDateString()
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  payment.status === 'paid' ? 'success' :
                                  payment.status === 'overdue' ? 'destructive' :
                                  'warning'
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/payments/${payment.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{property.propertyType.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={property.status === 'available' ? 'success' : 'default'}>
                    {property.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Area</p>
                  <p className="font-medium">{property.totalArea?.toLocaleString()} sq ft</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Floors</p>
                  <p className="font-medium">{property.totalFloors}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium">{property.yearBuilt}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parking Spaces</p>
                  <p className="font-medium">{property.parkingSpaces}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Monthly Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyRent)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue (All Time)</p>
                  <p className="text-xl font-semibold">{formatCurrency(totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Collections</p>
                  <p className="text-xl font-semibold text-yellow-600">{formatCurrency(pendingAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Rent per Unit</p>
                  <p className="text-xl font-semibold">
                    {totalUnits > 0 ? formatCurrency(totalMonthlyRent / totalUnits) : formatCurrency(0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
