import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { usePayments } from '../../hooks/usePayments';

const PaymentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { payments, loading } = usePayments();

  const filteredPayments = payments.filter(p =>
    `${p.tenantId} ${p.leaseId}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter(p => p.status === 'paid').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const overdueCount = payments.filter(p => p.status === 'overdue').length;

  const stats = [
    { label: 'Total Collected', value: `₹${(totalCollected / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Paid', value: paidCount.toString(), icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending', value: pendingCount.toString(), icon: Clock, color: 'text-orange-600' },
    { label: 'Overdue', value: overdueCount.toString(), icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rent Payment Dashboard</h1>
        <Button onClick={() => navigate('/payments/record')}>
          <Plus className="mr-2 h-4 w-4" /> Record Payment
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
              <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Loading payments...</TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {search ? 'No payment records found matching your search.' : 'No payment records found. Click "Record Payment" to add one.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.tenantId}</TableCell>
                    <TableCell>{payment.leaseId}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{payment.paymentMethod || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'paid' ? 'success' : payment.status === 'overdue' ? 'destructive' : 'warning'}>{payment.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/payments/${payment.id}`)}>View</Button>
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

export default PaymentListPage;
