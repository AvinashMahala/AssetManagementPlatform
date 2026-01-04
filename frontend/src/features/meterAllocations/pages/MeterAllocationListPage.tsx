import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { AppLayout } from '@/components/layout/AppLayout';
import { MeterAllocationTable } from '../components/MeterAllocationTable';
import { useMeterAllocations } from '../hooks/useMeterAllocations';

export const MeterAllocationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    data: response, 
    isLoading, 
    error, 
    deleteMeterAllocation,
    isDeleting,
    refetch 
  } = useMeterAllocations(page, 10);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      await deleteMeterAllocation(id);
    }
  };

  const filteredData = response?.data.filter(item => 
    item.meterId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subscriptionId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Meter Allocations
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage meter-to-subscription allocation rules
            </p>
          </div>
          <Button onClick={() => navigate('/meter-allocations/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Allocation
          </Button>
        </div>

        <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by Meter or Subscription ID..."
              className="pl-9"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error.message}</span>
          </div>
        )}

        <MeterAllocationTable
          data={filteredData}
          paginationInfo={response?.pagination || null}
          onPageChange={setPage}
          onEdit={(id) => navigate(`/meter-allocations/${id}`)}
          onDelete={handleDelete}
          deleting={isDeleting}
        />
      </div>
    </AppLayout>
  );
};
