import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Home, DoorOpen, DoorClosed, Square, Eye, Edit, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useUnits } from '../../hooks/useUnits';
import { useProperties } from '../../hooks/useProperties';
import { AppLayout } from '../../components/layout';

const UnitListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const { units, loading } = useUnits();
  const { properties } = useProperties();

  const filteredUnits = Array.isArray(units) ? units.filter(u => {
    const matchesSearch = `${u.unitNumber} ${u.unitType}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || u.propertyId === propertyFilter;
    return matchesSearch && matchesStatus && matchesProperty;
  }) : [];

  const availableCount = Array.isArray(units) ? units.filter(u => u.status === 'available').length : 0;
  const occupiedCount = Array.isArray(units) ? units.filter(u => u.status === 'occupied').length : 0;
  const maintenanceCount = Array.isArray(units) ? units.filter(u => u.status === 'under_maintenance').length : 0;

  const stats = [
    { label: 'Total Units', value: (Array.isArray(units) ? units.length : 0).toString(), icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Available', value: availableCount.toString(), icon: DoorOpen, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Occupied', value: occupiedCount.toString(), icon: DoorClosed, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Maintenance', value: maintenanceCount.toString(), icon: Square, color: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-900/20' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'under_maintenance', label: 'Under Maintenance' },
  ];

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'available': return 'default';
      case 'occupied': return 'secondary';
      case 'under_maintenance': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'occupied': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'under_maintenance': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  return (
    <AppLayout title="Units">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Unit Management</h1>
            <p className="text-muted-foreground">Manage and monitor all your property units</p>
          </div>
          <Button onClick={() => navigate('/units/create')} size="lg">
            <Plus className="mr-2 h-4 w-4" /> Add Unit
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

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by unit number, type..." 
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

                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Properties</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>{property.name}</option>
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
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-l-none"
                  >
                    Grid
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
                      <TableHead>Unit Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Area (sq ft)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          {search ? 'No units found matching your search.' : 'No units found. Click "Add Unit" to create one.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUnits.map((unit) => (
                        <TableRow 
                          key={unit.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/units/${unit.id}`)}
                        >
                          <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                          <TableCell>{unit.unitType}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                              {getPropertyName(unit.propertyId)}
                            </div>
                          </TableCell>
                          <TableCell>₹{unit.rent?.toLocaleString() || 'N/A'}</TableCell>
                          <TableCell>{unit.carpetArea || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(unit.status)}>
                              {unit.status.replace('_', ' ').charAt(0).toUpperCase() + unit.status.replace('_', ' ').slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/units/${unit.id}`);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/units/${unit.id}/edit`);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredUnits.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    {search ? 'No units found matching your search.' : 'No units found. Click "Add Unit" to create one.'}
                  </div>
                ) : (
                  filteredUnits.map((unit) => (
                    <Card 
                      key={unit.id} 
                      className="hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
                      onClick={() => navigate(`/units/${unit.id}`)}
                    >
                      {/* Status Banner */}
                      <div className={`h-2 ${
                        unit.status === 'available' ? 'bg-green-500' :
                        unit.status === 'occupied' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                              unit.status === 'available' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                              unit.status === 'occupied' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                              'bg-gradient-to-br from-gray-500 to-slate-600'
                            }`}>
                              {unit.unitNumber}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{unit.unitType}</CardTitle>
                              <p className="text-xs text-muted-foreground">ID: {unit.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <Badge variant={getStatusVariant(unit.status)} className={getStatusColor(unit.status)}>
                            {unit.status === 'available' ? 'Available' : unit.status === 'occupied' ? 'Occupied' : 'Maintenance'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Property</span>
                            <span className="font-medium flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              {getPropertyName(unit.propertyId).slice(0, 15)}...
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Rent</span>
                            <span className="font-bold text-primary">₹{unit.rent?.toLocaleString() || 'N/A'}/mo</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Carpet Area</span>
                            <span className="font-medium">{unit.carpetArea || 'N/A'} sq ft</span>
                          </div>
                          {unit.bedrooms && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Bedrooms</span>
                              <span className="font-medium">{unit.bedrooms} BHK</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/units/${unit.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/units/${unit.id}/edit`);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default UnitListPageEnhanced;
