import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Home, CheckCircle, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageLoadingSpinner } from '../../componentDesignLibrary';
import { useUnits } from '../../hooks/useUnits';

const UnitListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { units, loading } = useUnits();

  const filteredUnits = units.filter(u =>
    `${u.unitNumber} ${u.unitType}`.toLowerCase().includes(search.toLowerCase())
  );

  const availableCount = units.filter(u => u.status === 'available').length;
  const occupiedCount = units.filter(u => u.status === 'occupied').length;
  const maintenanceCount = units.filter(u => u.status === 'under_maintenance').length;

  const stats = [
    { label: 'Total Units', value: units.length.toString(), icon: Home, color: 'text-blue-600' },
    { label: 'Available', value: availableCount.toString(), icon: CheckCircle, color: 'text-green-600' },
    { label: 'Occupied', value: occupiedCount.toString(), icon: Home, color: 'text-orange-600' },
    { label: 'Maintenance', value: maintenanceCount.toString(), icon: Wrench, color: 'text-red-600' },
  ];

  return (
    <AppLayout>
      <div className="h-screen flex flex-col">
        {/* Header - Fixed height */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Unit Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and monitor all rental units
              </p>
            </div>
            <Button onClick={() => navigate('/units/create')} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Unit
            </Button>
          </div>
        </div>

        {/* Stats Cards - Fixed height */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50">
          <div className="grid gap-3 md:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <Card className="h-full flex flex-col shadow-sm">
            {/* Search Header - Fixed within card */}
            <CardHeader className="flex-shrink-0 pb-3">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search units..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
            </CardHeader>

            {/* Table Container - Scrollable */}
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white border-b">
                    <TableRow>
                      <TableHead className="h-12 px-6">Unit Number</TableHead>
                      <TableHead className="h-12 px-6">Type</TableHead>
                      <TableHead className="h-12 px-6">Property</TableHead>
                      <TableHead className="h-12 px-6">Rent</TableHead>
                      <TableHead className="h-12 px-6">Area (sq ft)</TableHead>
                      <TableHead className="h-12 px-6">Status</TableHead>
                      <TableHead className="h-12 px-6 w-48">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 h-32">
                          <div className="flex items-center justify-center">
                            <PageLoadingSpinner text="Loading units..." />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUnits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 h-32">
                          <div className="text-center">
                            <Home className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                              {search ? 'No units found matching your search.' : 'No units found. Click "Add Unit" to create one.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUnits.map((unit) => (
                        <TableRow key={unit.id} className="hover:bg-gray-50">
                          <TableCell className="px-6 py-3 font-medium">{unit.unitNumber}</TableCell>
                          <TableCell className="px-6 py-3">{unit.unitType}</TableCell>
                          <TableCell className="px-6 py-3">{unit.propertyId}</TableCell>
                          <TableCell className="px-6 py-3">₹{unit.monthlyRent?.toLocaleString() || 'N/A'}</TableCell>
                          <TableCell className="px-6 py-3">{unit.area || 'N/A'}</TableCell>
                          <TableCell className="px-6 py-3">
                            <Badge
                              variant={
                                unit.status === 'available' ? 'default' :
                                unit.status === 'occupied' ? 'secondary' :
                                'destructive'
                              }
                              className="text-xs"
                            >
                              {unit.status?.replace('_', ' ') || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/units/${unit.id}`)}
                                className="h-8 px-3 text-xs"
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/units/${unit.id}/dashboard`)}
                                className="h-8 px-3 text-xs"
                              >
                                Dashboard
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default UnitListPage;
