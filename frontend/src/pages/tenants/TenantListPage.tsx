import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useTenants } from '../../hooks/useTenants';

const TenantListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { tenants, loading } = useTenants();

  const filteredTenants = tenants.filter(t =>
    `${t.firstName} ${t.lastName} ${t.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = tenants.filter(t => t.status === 'active').length;
  const inactiveCount = tenants.filter(t => t.status !== 'active').length;

  const stats = [
    { label: 'Total Tenants', value: tenants.length.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Active', value: activeCount.toString(), icon: UserCheck, color: 'text-green-600' },
    { label: 'Inactive', value: inactiveCount.toString(), icon: UserX, color: 'text-gray-600' },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tenant Management</h1>
        <Button onClick={() => navigate('/tenants/create')}>
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tenants..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading tenants...</TableCell>
                </TableRow>
              ) : filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {search ? 'No tenants found matching your search.' : 'No tenants found. Click "Add Tenant" to create one.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.firstName} {tenant.lastName}</TableCell>
                    <TableCell>{tenant.email}</TableCell>
                    <TableCell>{tenant.phone}</TableCell>
                    <TableCell>{tenant.occupation}</TableCell>
                    <TableCell>
                      <Badge variant={tenant.status === 'active' ? 'success' : 'default'}>{tenant.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/tenants/${tenant.id}`)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantListPage;
