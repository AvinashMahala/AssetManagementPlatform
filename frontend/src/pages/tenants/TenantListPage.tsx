import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AppLayout } from '../../components/layout/AppLayout';
import { useTenants } from '../../hooks/useTenants';
import { useProperties } from '../../hooks';

const TenantListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const { tenants, loading } = useTenants();
  const { properties: availableProperties, loading: propertiesLoading } = useProperties();

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = `${t.firstName} ${t.lastName} ${t.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesProperty = propertyFilter === 'all' || t.currentPropertyId === propertyFilter;
    return matchesSearch && matchesProperty;
  });

  const activeCount = tenants.filter(t => t.status === 'active').length;
  const inactiveCount = tenants.filter(t => t.status !== 'active').length;

  const stats = [
    { label: 'Total Tenants', value: tenants.length.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Active', value: activeCount.toString(), icon: UserCheck, color: 'text-green-600' },
    { label: 'Inactive', value: inactiveCount.toString(), icon: UserX, color: 'text-gray-600' },
  ];

  return (
    <AppLayout>
      <div className="h-screen flex flex-col">
        {/* Header - Fixed height */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage tenant information and relationships
              </p>
            </div>
            <Button onClick={() => navigate('/tenants/create')} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Tenant
            </Button>
          </div>
        </div>

        {/* Stats Cards - Fixed height */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50">
          <div className="grid gap-3 md:grid-cols-3">
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

        {/* Filters - Fixed height */}
        <div className="flex-shrink-0 px-6 py-3 bg-white border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tenants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="w-64">
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={propertiesLoading ? "Loading properties..." : "Filter by property"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {availableProperties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tenants Table - Scrollable */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <Card className="h-full flex flex-col shadow-sm">
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white border-b">
                    <TableRow>
                      <TableHead className="h-12 px-6">Name</TableHead>
                      <TableHead className="h-12 px-6">Email</TableHead>
                      <TableHead className="h-12 px-6">Phone</TableHead>
                      <TableHead className="h-12 px-6">Property</TableHead>
                      <TableHead className="h-12 px-6">Status</TableHead>
                      <TableHead className="h-12 px-6 w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 h-32">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                            Loading tenants...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredTenants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 h-32">
                          <div className="text-center">
                            <Users className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                              {search || propertyFilter ? 'No tenants found matching your filters.' : 'No tenants found. Click "Add Tenant" to create one.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTenants.map((tenant) => {
                        const propertyName = availableProperties?.find(p => p.id === tenant.currentPropertyId)?.name || 'N/A';
                        return (
                          <TableRow key={tenant.id} className="hover:bg-gray-50">
                            <TableCell className="px-6 py-3 font-medium">
                              {tenant.firstName} {tenant.lastName}
                            </TableCell>
                            <TableCell className="px-6 py-3">{tenant.email}</TableCell>
                            <TableCell className="px-6 py-3">{tenant.phone}</TableCell>
                            <TableCell className="px-6 py-3">{propertyName}</TableCell>
                            <TableCell className="px-6 py-3">
                              <Badge
                                variant={tenant.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {tenant.status || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/tenants/${tenant.id}/dashboard`)}
                                  className="h-8 px-3 text-xs"
                                >
                                  Dashboard
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                                  className="h-8 px-3 text-xs"
                                >
                                  View
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default TenantListPage;
