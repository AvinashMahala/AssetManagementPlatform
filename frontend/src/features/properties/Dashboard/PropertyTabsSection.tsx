import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Home,
  FileText,
  DollarSign,
  FileImage,
  Building2,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Layers,
  ParkingCircle,
  MapPin,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { PropertyFileGallery } from '../../../components/files';

interface Unit {
  id: string;
  unitNumber: string;
  unitType: string;
  status: string;
  monthlyRent: number;
  area?: number;
  bedrooms?: number;
}

interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  status: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
}

interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  lateFee?: number;
}

interface Property {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  propertyType: string;
  status: string;
  yearBuilt?: number;
  totalFloors?: number;
  totalArea?: number;
  parkingSpaces?: number;
}

interface PropertyTabsSectionProps {
  property: Property;
  units: Unit[];
  propertyLeases: Lease[];
  propertyPayments: Payment[];
  metrics: {
    totalUnits: number;
    occupiedUnits: number;
    activeLeases: number;
    totalMonthlyRent: number;
    totalRevenue: number;
    pendingAmount: number;
    overdueAmount: number;
    collectionRate: string;
    paidPayments: number;
    pendingPayments: number;
    overduePayments: number;
  };
  fileRefreshTrigger: number;
  formatCurrency: (amount: number | undefined | null) => string;
  getUnitStatusColor: (status: string) => string;
  getLeaseStatusColor: (status: string) => string;
  getPaymentStatusColor: (status: string) => string;
  getTenantName: (tenantId: string) => string;
  getUnitNumber: (unitId: string) => string;
  onNavigate: (path: string) => void;
}

export const PropertyTabsSection: React.FC<PropertyTabsSectionProps> = ({
  property,
  units,
  propertyLeases,
  propertyPayments,
  metrics,
  fileRefreshTrigger,
  formatCurrency,
  getUnitStatusColor,
  getLeaseStatusColor,
  getPaymentStatusColor,
  getTenantName,
  getUnitNumber,
  onNavigate,
}) => {
  return (
    <Tabs defaultValue="units" className="property-tabs space-y-4">
      <TabsList className="tabs-list grid w-full grid-cols-5">
        <TabsTrigger value="units" className="tab-trigger">
          <Home className="tab-icon w-4 h-4 mr-2" />
          Units
        </TabsTrigger>
        <TabsTrigger value="leases" className="tab-trigger">
          <FileText className="tab-icon w-4 h-4 mr-2" />
          Leases
        </TabsTrigger>
        <TabsTrigger value="payments" className="tab-trigger">
          <DollarSign className="tab-icon w-4 h-4 mr-2" />
          Payments
        </TabsTrigger>
        <TabsTrigger value="files" className="tab-trigger">
          <FileImage className="tab-icon w-4 h-4 mr-2" />
          Files
        </TabsTrigger>
        <TabsTrigger value="details" className="tab-trigger">
          <Building2 className="tab-icon w-4 h-4 mr-2" />
          Details
        </TabsTrigger>
      </TabsList>

      {/* Units Tab */}
      <TabsContent value="units" className="tab-content-units space-y-4">
        <div className="units-header flex justify-between items-center">
          <div className="units-info">
            <h3 className="units-title text-lg font-semibold">Units in this Property</h3>
            <p className="units-description text-sm text-muted-foreground">
              {metrics.totalUnits} total units • {metrics.occupiedUnits} occupied
            </p>
          </div>
          <Button size="sm" onClick={() => onNavigate(`/units/create?propertyId=${property.id}`)} className="add-unit-btn">
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </Button>
        </div>

        {units.length === 0 ? (
          <Card className="empty-state-card">
            <CardContent className="empty-state-content pt-6">
              <div className="empty-state-message text-center py-8">
                <Home className="empty-state-icon mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="empty-state-title text-lg font-semibold mb-2">No units yet</h3>
                <p className="empty-state-description text-muted-foreground mb-4">Add units to this property to get started.</p>
                <Button onClick={() => onNavigate(`/units/create?propertyId=${property.id}`)} className="empty-state-action">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Unit
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="units-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <Card key={unit.id} className="unit-card hover:shadow-md transition-shadow">
                <CardHeader className="unit-header pb-3">
                  <div className="unit-header-content flex justify-between items-start">
                    <div className="unit-info">
                      <CardTitle className="unit-title text-lg">Unit {unit.unitNumber}</CardTitle>
                      <CardDescription className="unit-type mt-1">
                        {unit.unitType.replace('_', ' ').toUpperCase()}
                      </CardDescription>
                    </div>
                    <Badge className={`unit-status ${getUnitStatusColor(unit.status)}`}>
                      {unit.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="unit-content space-y-3">
                  <div className="unit-details grid grid-cols-2 gap-3">
                    <div className="unit-detail">
                      <span className="unit-detail-label text-sm text-muted-foreground">Monthly Rent</span>
                      <span className="unit-detail-value font-semibold">{formatCurrency(unit.monthlyRent)}</span>
                    </div>
                    <div className="unit-detail">
                      <span className="unit-detail-label text-sm text-muted-foreground">Area</span>
                      <span className="unit-detail-value font-semibold">{unit.area?.toLocaleString() || 'N/A'} sq ft</span>
                    </div>
                    <div className="unit-detail">
                      <span className="unit-detail-label text-sm text-muted-foreground">Bedrooms</span>
                      <span className="unit-detail-value font-semibold">{unit.bedrooms || 'N/A'}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="unit-action w-full mt-2"
                    onClick={() => onNavigate(`/units/${unit.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Leases Tab */}
      <TabsContent value="leases" className="tab-content-leases space-y-4">
        <div className="leases-info">
          <h3 className="leases-title text-lg font-semibold">Active Leases</h3>
          <p className="leases-description text-sm text-muted-foreground">
            {metrics.activeLeases} active lease agreements
          </p>
        </div>

        {propertyLeases.length === 0 ? (
          <Card className="empty-state-card">
            <CardContent className="empty-state-content pt-6">
              <div className="empty-state-message text-center py-8">
                <FileText className="empty-state-icon mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="empty-state-title text-lg font-semibold mb-2">No leases</h3>
                <p className="empty-state-description text-muted-foreground">No lease agreements for this property yet.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="leases-list space-y-3">
            {propertyLeases.map((lease) => {
              const unit = units.find(u => u.id === lease.unitId);
              const daysUntilExpiry = Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

              return (
                <Card key={lease.id} className={`lease-card hover:shadow-md transition-shadow ${isExpiringSoon ? 'lease-expiring border-orange-200 dark:border-orange-800' : ''}`}>
                  <CardHeader className="lease-header pb-3">
                    <div className="lease-header-content flex justify-between items-start">
                      <div className="lease-info">
                        <CardTitle className="lease-title text-base">Unit {unit?.unitNumber || 'N/A'}</CardTitle>
                        <CardDescription className="lease-tenant mt-1">
                          {getTenantName(lease.tenantId)}
                        </CardDescription>
                      </div>
                      <Badge className={`lease-status ${getLeaseStatusColor(lease.status)}`}>
                        {lease.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="lease-content">
                    <div className="lease-details grid grid-cols-2 gap-3 text-sm">
                      <div className="lease-detail">
                        <p className="lease-detail-label text-muted-foreground">Monthly Rent</p>
                        <p className="lease-detail-value font-semibold">{formatCurrency(lease.monthlyRent)}</p>
                      </div>
                      <div className="lease-detail">
                        <p className="lease-detail-label text-muted-foreground">Security Deposit</p>
                        <p className="lease-detail-value font-semibold">{formatCurrency(lease.securityDeposit)}</p>
                      </div>
                      <div className="lease-detail">
                        <p className="lease-detail-label text-muted-foreground">Start Date</p>
                        <p className="lease-detail-value font-medium">{format(new Date(lease.startDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="lease-detail">
                        <p className="lease-detail-label text-muted-foreground">End Date</p>
                        <p className="lease-detail-value font-medium">{format(new Date(lease.endDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    {isExpiringSoon && (
                      <div className="lease-expiry-notice mt-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <AlertCircle className="lease-expiry-icon h-4 w-4" />
                        <span className="lease-expiry-text text-sm">Expires in {daysUntilExpiry} days</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="lease-action w-full mt-3"
                      onClick={() => onNavigate(`/leases/${lease.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Lease
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* Payments Tab */}
      <TabsContent value="payments" className="tab-content-payments space-y-4">
        {/* Payment Summary */}
        <div className="payment-summary grid gap-4 md:grid-cols-4">
          <Card className="payment-summary-card">
            <CardHeader className="payment-summary-header pb-2">
              <CardTitle className="payment-summary-title text-sm font-medium text-muted-foreground">Collected</CardTitle>
            </CardHeader>
            <CardContent className="payment-summary-content">
              <div className="payment-summary-value flex items-center gap-2">
                <CheckCircle className="payment-summary-icon h-4 w-4 text-green-600" />
                <div className="payment-summary-amount text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</div>
              </div>
              <p className="payment-summary-description text-xs text-muted-foreground mt-1">{metrics.paidPayments} payments</p>
            </CardContent>
          </Card>
          <Card className="payment-summary-card">
            <CardHeader className="payment-summary-header pb-2">
              <CardTitle className="payment-summary-title text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent className="payment-summary-content">
              <div className="payment-summary-value flex items-center gap-2">
                <Clock className="payment-summary-icon h-4 w-4 text-yellow-600" />
                <div className="payment-summary-amount text-2xl font-bold text-yellow-600">{formatCurrency(metrics.pendingAmount)}</div>
              </div>
              <p className="payment-summary-description text-xs text-muted-foreground mt-1">{metrics.pendingPayments} payments</p>
            </CardContent>
          </Card>
          <Card className="payment-summary-card">
            <CardHeader className="payment-summary-header pb-2">
              <CardTitle className="payment-summary-title text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent className="payment-summary-content">
              <div className="payment-summary-value flex items-center gap-2">
                <AlertCircle className="payment-summary-icon h-4 w-4 text-red-600" />
                <div className="payment-summary-amount text-2xl font-bold text-red-600">{formatCurrency(metrics.overdueAmount)}</div>
              </div>
              <p className="payment-summary-description text-xs text-muted-foreground mt-1">{metrics.overduePayments} payments</p>
            </CardContent>
          </Card>
          <Card className="payment-summary-card">
            <CardHeader className="payment-summary-header pb-2">
              <CardTitle className="payment-summary-title text-sm font-medium text-muted-foreground">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent className="payment-summary-content">
              <div className="payment-summary-value flex items-center gap-2">
                <BarChart3 className="payment-summary-icon h-4 w-4 text-blue-600" />
                <div className="payment-summary-amount text-2xl font-bold">{metrics.collectionRate}%</div>
              </div>
              <p className="payment-summary-description text-xs text-muted-foreground mt-1">of total payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <div className="recent-payments">
          <h3 className="recent-payments-title text-lg font-semibold mb-3">Recent Payments</h3>
          {propertyPayments.length === 0 ? (
            <Card className="empty-state-card">
              <CardContent className="empty-state-content pt-6">
                <div className="empty-state-message text-center py-8">
                  <DollarSign className="empty-state-icon mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="empty-state-title text-lg font-semibold mb-2">No payments</h3>
                  <p className="empty-state-description text-muted-foreground">No payment records for this property yet.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="payments-list space-y-3">
              {propertyPayments.slice(0, 10).map((payment) => {
                const lease = propertyLeases.find(l => l.id === payment.leaseId);
                const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

                return (
                  <Card key={payment.id} className={`payment-card hover:shadow-md transition-shadow ${isOverdue ? 'payment-overdue border-red-200 dark:border-red-800' : ''}`}>
                    <CardContent className="payment-content pt-6">
                      <div className="payment-header flex justify-between items-start">
                        <div className="payment-info space-y-2">
                          <div className="payment-tenant">
                            <p className="payment-unit font-semibold">Unit {getUnitNumber(lease?.unitId || '')}</p>
                            <p className="payment-tenant-name text-sm text-muted-foreground">
                              {lease ? getTenantName(lease.tenantId) : 'Unknown'}
                            </p>
                          </div>
                          <div className="payment-details flex items-center gap-4 text-sm">
                            <div className="payment-amount">
                              <span className="payment-amount-label text-muted-foreground">Amount: </span>
                              <span className="payment-amount-value font-semibold">{formatCurrency(payment.amount)}</span>
                            </div>
                            <div className="payment-due-date">
                              <span className="payment-due-label text-muted-foreground">Due: </span>
                              <span className="payment-due-value">{format(new Date(payment.dueDate), 'MMM dd, yyyy')}</span>
                            </div>
                            {payment.paidDate && (
                              <div className="payment-paid-date">
                                <span className="payment-paid-label text-muted-foreground">Paid: </span>
                                <span className="payment-paid-value">{format(new Date(payment.paidDate), 'MMM dd, yyyy')}</span>
                              </div>
                            )}
                          </div>
                          {isOverdue && (
                            <div className="payment-overdue-notice flex items-center gap-2 text-red-600 dark:text-red-400">
                              <AlertCircle className="payment-overdue-icon h-4 w-4" />
                              <span className="payment-overdue-text text-sm">Overdue</span>
                            </div>
                          )}
                        </div>
                        <div className="payment-actions flex flex-col items-end gap-2">
                          <Badge className={`payment-status ${getPaymentStatusColor(payment.status)}`}>
                            {payment.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="payment-view-btn"
                            onClick={() => onNavigate(`/payments/${payment.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </TabsContent>

      {/* Files Tab */}
      <TabsContent value="files" className="tab-content-files space-y-4">
        <Card className="files-card">
          <CardHeader className="files-header">
            <CardTitle className="files-title flex items-center gap-2">
              <FileImage className="files-icon h-5 w-5" />
              Property Files & Documents
            </CardTitle>
            <CardDescription className="files-description">
              Upload and manage photos and documents for this property
            </CardDescription>
          </CardHeader>
          <CardContent className="files-content">
            <PropertyFileGallery
              propertyId={property.id}
              refreshTrigger={fileRefreshTrigger}
              onFileDeleted={(_fileId: string) => {}}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Details Tab */}
      <TabsContent value="details" className="tab-content-details space-y-4">
        <div className="property-details-grid grid gap-4 md:grid-cols-2">
          {/* Property Information */}
          <Card className="property-info-card">
            <CardHeader className="property-info-header">
              <CardTitle className="property-info-title text-lg flex items-center gap-2">
                <Building2 className="property-info-icon h-5 w-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="property-info-content space-y-4">
              <div className="property-info-grid grid grid-cols-2 gap-4">
                <div className="property-info-item">
                  <p className="property-info-label text-sm text-muted-foreground">Property Type</p>
                  <p className="property-info-value font-medium">{property.propertyType.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div className="property-info-item">
                  <p className="property-info-label text-sm text-muted-foreground">Status</p>
                  <Badge className={`property-status ${getUnitStatusColor(property.status)}`}>
                    {property.status}
                  </Badge>
                </div>
                <div className="property-info-item">
                  <p className="property-info-label text-sm text-muted-foreground">Year Built</p>
                  <p className="property-info-value font-medium">{property.yearBuilt || 'N/A'}</p>
                </div>
                <div className="property-info-item">
                  <p className="property-info-label text-sm text-muted-foreground">Total Floors</p>
                  <p className="property-info-value font-medium flex items-center gap-1">
                    <Layers className="property-info-icon-small h-4 w-4" />
                    {property.totalFloors || 'N/A'}
                  </p>
                </div>
                <div className="property-info-item">
                  <p className="property-info-label text-sm text-muted-foreground">Total Area</p>
                  <p className="property-info-value font-medium">{property.totalArea?.toLocaleString() || 'N/A'} sq ft</p>
                </div>
                <div className="property-info-item">
                  <p className="property-info-label text-sm text-muted-foreground">Parking Spaces</p>
                  <p className="property-info-value font-medium flex items-center gap-1">
                    <ParkingCircle className="property-info-icon-small h-4 w-4" />
                    {property.parkingSpaces || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="financial-summary-card">
            <CardHeader className="financial-summary-header">
              <CardTitle className="financial-summary-title text-lg flex items-center gap-2">
                <BarChart3 className="financial-summary-icon h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="financial-summary-content space-y-4">
              <div className="financial-metric">
                <p className="financial-metric-label text-sm text-muted-foreground">Monthly Income</p>
                <p className="financial-metric-value text-2xl font-bold text-green-600">{formatCurrency(metrics.totalMonthlyRent)}</p>
                <p className="financial-metric-description text-xs text-muted-foreground mt-1">From active leases</p>
              </div>
              <div className="financial-metric">
                <p className="financial-metric-label text-sm text-muted-foreground">Total Revenue</p>
                <p className="financial-metric-value text-xl font-semibold">{formatCurrency(metrics.totalRevenue)}</p>
                <p className="financial-metric-description text-xs text-muted-foreground mt-1">All-time collections</p>
              </div>
              <div className="financial-metric">
                <p className="financial-metric-label text-sm text-muted-foreground">Pending Collections</p>
                <p className="financial-metric-value text-xl font-semibold text-yellow-600">{formatCurrency(metrics.pendingAmount)}</p>
                <p className="financial-metric-description text-xs text-muted-foreground mt-1">Outstanding payments</p>
              </div>
              <div className="financial-metric">
                <p className="financial-metric-label text-sm text-muted-foreground">Average Rent per Unit</p>
                <p className="financial-metric-value text-xl font-semibold">
                  {metrics.totalUnits > 0 ? formatCurrency(metrics.totalMonthlyRent / metrics.totalUnits) : formatCurrency(0)}
                </p>
                <p className="financial-metric-description text-xs text-muted-foreground mt-1">Per occupied unit</p>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="address-card md:col-span-2">
            <CardHeader className="address-header">
              <CardTitle className="address-title text-lg flex items-center gap-2">
                <MapPin className="address-icon h-5 w-5" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="address-content">
              <div className="address-details space-y-2">
                <p className="address-street font-medium">{property.address.street}</p>
                <p className="address-city-state text-muted-foreground">
                  {property.address.city}, {property.address.state} {property.address.pincode}
                </p>
                {property.address.landmark && (
                  <p className="address-landmark text-sm text-muted-foreground">Landmark: {property.address.landmark}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};