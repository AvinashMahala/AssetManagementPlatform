import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { AppLayout } from '../../components/layout/AppLayout';
import { useLeases } from '../../hooks/useLeases';

const LeaseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { leases, loading } = useLeases();

  const filteredLeases = leases.filter(l =>
    `${l.unitId} ${l.tenantId}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = leases.filter(l => l.status === 'active').length;
  const expiredCount = leases.filter(l => l.status === 'expired').length;
  const draftCount = leases.filter(l => l.status === 'draft').length;

  const stats = [
    { label: 'Total Leases', value: leases.length.toString(), icon: FileText, color: 'text-blue-600' },
    { label: 'Active', value: activeCount.toString(), icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Expired', value: expiredCount.toString(), icon: XCircle, color: 'text-red-600' },
    { label: 'Draft', value: draftCount.toString(), icon: Clock, color: 'text-orange-600' },
  ];

  return (
    <AppLayout title="Lease Management">
      <div className="flex flex-col h-full">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Lease Management</h1>
            <Button onClick={() => navigate('/leases/create')}>
              <Plus className="mr-2 h-4 w-4" /> Create Lease
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
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

          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search leases..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Scrollable Table Section */}
        <div className="flex-1 overflow-hidden">
          <Card className="h-full border-0 shadow-none">
            <CardContent className="p-0 h-full">
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">Loading leases...</TableCell>
                      </TableRow>
                    ) : filteredLeases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {search ? 'No leases found matching your search.' : 'No leases found. Click "Create Lease" to add one.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLeases.map((lease) => (
                        <TableRow key={lease.id}>
                          <TableCell className="font-medium">{lease.unitId}</TableCell>
                          <TableCell>{lease.tenantId}</TableCell>
                          <TableCell>{new Date(lease.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(lease.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>₹{lease.monthlyRent.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={lease.status === 'active' ? 'success' : lease.status === 'expired' ? 'destructive' : 'warning'}>{lease.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/leases/${lease.id}`)}>View</Button>
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

export default LeaseListPage;
