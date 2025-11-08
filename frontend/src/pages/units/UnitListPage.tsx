import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Home, CheckCircle, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Unit Management</h1>
        <Button onClick={() => navigate('/units/create')}>
          <Plus className="mr-2 h-4 w-4" /> Add Unit
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
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
              <Input placeholder="Search units..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Area (sq ft)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading units...</TableCell>
                </TableRow>
              ) : filteredUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {search ? 'No units found matching your search.' : 'No units found. Click "Add Unit" to create one.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                    <TableCell>{unit.unitType}</TableCell>
                    <TableCell>{unit.propertyId}</TableCell>
                    <TableCell>₹{unit.monthlyRent?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>{unit.area || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={unit.status === 'available' ? 'success' : unit.status === 'occupied' ? 'warning' : 'default'}>{unit.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/units/${unit.id}`)}>View</Button>
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

export default UnitListPage;
