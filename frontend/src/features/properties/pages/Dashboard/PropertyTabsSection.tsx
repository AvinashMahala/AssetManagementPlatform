import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
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
import { PropertyFileGallery } from '@/features/files';
import styles from './PropertyTabsSection.module.scss';

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
    <Tabs defaultValue="units" className={`${styles.propertyTabs} space-y-4`}>
      <TabsList className={`${styles.tabsList} grid w-full grid-cols-5`}>
        <TabsTrigger value="units" className={styles.tabTrigger}>
          <Home className={`${styles.tabIcon} w-4 h-4 mr-2`} />
          Units
        </TabsTrigger>
        <TabsTrigger value="leases" className={styles.tabTrigger}>
          <FileText className={`${styles.tabIcon} w-4 h-4 mr-2`} />
          Leases
        </TabsTrigger>
        <TabsTrigger value="payments" className={styles.tabTrigger}>
          <DollarSign className={`${styles.tabIcon} w-4 h-4 mr-2`} />
          Payments
        </TabsTrigger>
        <TabsTrigger value="files" className={styles.tabTrigger}>
          <FileImage className={`${styles.tabIcon} w-4 h-4 mr-2`} />
          Files
        </TabsTrigger>
        <TabsTrigger value="details" className={styles.tabTrigger}>
          <Building2 className={`${styles.tabIcon} w-4 h-4 mr-2`} />
          Details
        </TabsTrigger>
      </TabsList>

      {/* Units Tab */}
      <TabsContent value="units" className={`${styles.tabContent} space-y-4`}>
        <div className={`${styles.unitsHeader} flex justify-between items-center`}>
          <div>
            <h3 className={`${styles.unitsTitle} text-lg font-semibold`}>Units in this Property</h3>
            <p className={`${styles.unitsDescription} text-sm`}>
              {metrics.totalUnits} total units • {metrics.occupiedUnits} occupied
            </p>
          </div>
          <Button size="sm" onClick={() => onNavigate(`/units/create?propertyId=${property.id}`)} className={styles.addUnitBtn}>
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </Button>
        </div>

        {units.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No units yet</h3>
                <p className="text-muted-foreground mb-4">Add units to this property to get started.</p>
                <Button onClick={() => onNavigate(`/units/create?propertyId=${property.id}`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Unit
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={`${styles.unitsGrid} grid gap-4 md:grid-cols-2 lg:grid-cols-3`}>
            {units.map((unit, index) => (
              <Card key={unit.id} className={styles.unitCard} style={{ '--unit-index': index } as React.CSSProperties}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={`${styles.unitTitle} text-lg`}>Unit {unit.unitNumber}</CardTitle>
                      <CardDescription className={`${styles.unitType} mt-1`}>
                        {unit.unitType.replace('_', ' ').toUpperCase()}
                      </CardDescription>
                    </div>
                    <Badge className={`${styles.unitStatus} ${getUnitStatusColor(unit.status)}`}>
                      {unit.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`${styles.unitDetails} grid grid-cols-2 gap-3`}>
                    <div>
                      <span className={styles.unitDetailLabel}>Monthly Rent</span>
                      <div className={styles.unitDetailValue}>{formatCurrency(unit.monthlyRent)}</div>
                    </div>
                    <div>
                      <span className={styles.unitDetailLabel}>Area</span>
                      <div className={styles.unitDetailValue}>{unit.area?.toLocaleString() || 'N/A'} sq ft</div>
                    </div>
                    <div>
                      <span className={styles.unitDetailLabel}>Bedrooms</span>
                      <div className={styles.unitDetailValue}>{unit.bedrooms || 'N/A'}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${styles.unitAction} w-full mt-2`}
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
      <TabsContent value="leases" className={`${styles.tabContent} space-y-4`}>
        <div className={styles.leasesInfo}>
          <h3 className={`${styles.leasesTitle} text-lg font-semibold`}>Active Leases</h3>
          <p className={`${styles.leasesDescription} text-sm`}>
            {metrics.activeLeases} active lease agreements
          </p>
        </div>

        {propertyLeases.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No leases</h3>
                <p className="text-muted-foreground">No lease agreements for this property yet.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={`${styles.leasesList} space-y-3`}>
            {propertyLeases.map((lease, index) => {
              const unit = units.find(u => u.id === lease.unitId);
              const daysUntilExpiry = Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

              return (
                <Card key={lease.id} className={`${styles.leaseCard} ${isExpiringSoon ? styles.leaseExpiring : ''}`} style={{ '--lease-index': index } as React.CSSProperties}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className={`${styles.leaseTitle} text-base`}>Unit {unit?.unitNumber || 'N/A'}</CardTitle>
                        <CardDescription className={`${styles.leaseTenant} mt-1`}>
                          {getTenantName(lease.tenantId)}
                        </CardDescription>
                      </div>
                      <Badge className={`${styles.leaseStatus} ${getLeaseStatusColor(lease.status)}`}>
                        {lease.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`${styles.leaseDetails} grid grid-cols-2 gap-3 text-sm`}>
                      <div>
                        <p className={styles.leaseDetailLabel}>Monthly Rent</p>
                        <p className={styles.leaseDetailValue}>{formatCurrency(lease.monthlyRent)}</p>
                      </div>
                      <div>
                        <p className={styles.leaseDetailLabel}>Security Deposit</p>
                        <p className={styles.leaseDetailValue}>{formatCurrency(lease.securityDeposit)}</p>
                      </div>
                      <div>
                        <p className={styles.leaseDetailLabel}>Start Date</p>
                        <p className="font-medium">{format(new Date(lease.startDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className={styles.leaseDetailLabel}>End Date</p>
                        <p className="font-medium">{format(new Date(lease.endDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    {isExpiringSoon && (
                      <div className={`${styles.leaseExpiryNotice} mt-3 flex items-center gap-2 text-orange-600 dark:text-orange-400`}>
                        <AlertCircle className={`${styles.leaseExpiryIcon} h-4 w-4`} />
                        <span className={`${styles.leaseExpiryText} text-sm`}>Expires in {daysUntilExpiry} days</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${styles.leaseAction} w-full mt-3`}
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
      <TabsContent value="payments" className={`${styles.tabContent} space-y-4`}>
        {/* Payment Summary */}
        <div className={`${styles.paymentSummary} grid gap-4 md:grid-cols-4`}>
          <Card className={styles.paymentSummaryCard}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className={`${styles.paymentSummaryIcon} h-4 w-4 text-green-600`} />
                <div className={`${styles.paymentSummaryAmount} text-2xl font-bold text-green-600`}>{formatCurrency(metrics.totalRevenue)}</div>
              </div>
              <p className={`${styles.paymentSummaryDescription} text-xs text-muted-foreground mt-1`}>{metrics.paidPayments} payments</p>
            </CardContent>
          </Card>
          <Card className={styles.paymentSummaryCard}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className={`${styles.paymentSummaryIcon} h-4 w-4 text-yellow-600`} />
                <div className={`${styles.paymentSummaryAmount} text-2xl font-bold text-yellow-600`}>{formatCurrency(metrics.pendingAmount)}</div>
              </div>
              <p className={`${styles.paymentSummaryDescription} text-xs text-muted-foreground mt-1`}>{metrics.pendingPayments} payments</p>
            </CardContent>
          </Card>
          <Card className={styles.paymentSummaryCard}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className={`${styles.paymentSummaryIcon} h-4 w-4 text-red-600`} />
                <div className={`${styles.paymentSummaryAmount} text-2xl font-bold text-red-600`}>{formatCurrency(metrics.overdueAmount)}</div>
              </div>
              <p className={`${styles.paymentSummaryDescription} text-xs text-muted-foreground mt-1`}>{metrics.overduePayments} payments</p>
            </CardContent>
          </Card>
          <Card className={styles.paymentSummaryCard}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart3 className={`${styles.paymentSummaryIcon} h-4 w-4 text-blue-600`} />
                <div className={`${styles.paymentSummaryAmount} text-2xl font-bold`}>{metrics.collectionRate}%</div>
              </div>
              <p className={`${styles.paymentSummaryDescription} text-xs text-muted-foreground mt-1`}>of total payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <div>
          <h3 className={`${styles.recentPaymentsTitle} text-lg font-semibold mb-3`}>Recent Payments</h3>
          {propertyPayments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payments</h3>
                  <p className="text-muted-foreground">No payment records for this property yet.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={`${styles.paymentsList} space-y-3`}>
              {propertyPayments.slice(0, 10).map((payment, index) => {
                const lease = propertyLeases.find(l => l.id === payment.leaseId);
                const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

                return (
                  <Card key={payment.id} className={`${styles.paymentCard} ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`} style={{ '--payment-index': index } as React.CSSProperties}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div>
                            <p className="font-semibold">Unit {getUnitNumber(lease?.unitId || '')}</p>
                            <p className="text-sm text-muted-foreground">
                              {lease ? getTenantName(lease.tenantId) : 'Unknown'}
                            </p>
                          </div>
                          <div className={`${styles.paymentDetails} flex items-center gap-4 text-sm`}>
                            <div>
                              <span className={styles.paymentDetailLabel}>Amount: </span>
                              <span className={styles.paymentDetailValue}>{formatCurrency(payment.amount)}</span>
                            </div>
                            <div>
                              <span className={styles.paymentDetailLabel}>Due: </span>
                              <span>{format(new Date(payment.dueDate), 'MMM dd, yyyy')}</span>
                            </div>
                            {payment.paidDate && (
                              <div>
                                <span className={styles.paymentDetailLabel}>Paid: </span>
                                <span>{format(new Date(payment.paidDate), 'MMM dd, yyyy')}</span>
                              </div>
                            )}
                          </div>
                          {isOverdue && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">Overdue</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${styles.paymentStatus} ${getPaymentStatusColor(payment.status)}`}>
                            {payment.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={styles.paymentAction}
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
      <TabsContent value="files" className={`${styles.tabContent} space-y-4`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Property Files & Documents
            </CardTitle>
            <CardDescription>
              Upload and manage photos and documents for this property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyFileGallery
              propertyId={property.id}
              refreshTrigger={fileRefreshTrigger}
              onFileDeleted={(_fileId: string) => {}}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Details Tab */}
      <TabsContent value="details" className={`${styles.tabContent} space-y-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-medium">{property.propertyType.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getUnitStatusColor(property.status)}>
                    {property.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium">{property.yearBuilt || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Floors</p>
                  <p className="font-medium flex items-center gap-1">
                    <Layers className="h-4 w-4" />
                    {property.totalFloors || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Area</p>
                  <p className="font-medium">{property.totalArea?.toLocaleString() || 'N/A'} sq ft</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parking Spaces</p>
                  <p className="font-medium flex items-center gap-1">
                    <ParkingCircle className="h-4 w-4" />
                    {property.parkingSpaces || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalMonthlyRent)}</p>
                <p className="text-xs text-muted-foreground mt-1">From active leases</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-semibold">{formatCurrency(metrics.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">All-time collections</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Collections</p>
                <p className="text-xl font-semibold text-yellow-600">{formatCurrency(metrics.pendingAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">Outstanding payments</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rent per Unit</p>
                <p className="text-xl font-semibold">
                  {metrics.totalUnits > 0 ? formatCurrency(metrics.totalMonthlyRent / metrics.totalUnits) : formatCurrency(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Per occupied unit</p>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{property.address.street}</p>
                <p className="text-muted-foreground">
                  {property.address.city}, {property.address.state} {property.address.pincode}
                </p>
                {property.address.landmark && (
                  <p className="text-sm text-muted-foreground">Landmark: {property.address.landmark}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};
