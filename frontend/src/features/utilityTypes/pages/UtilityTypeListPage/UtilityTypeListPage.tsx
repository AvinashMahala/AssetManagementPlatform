import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { PageHeader } from '@/componentDesignLibrary/components/PageHeader';
import { useUtilityTypes, useDeleteUtilityType } from '../../hooks/useUtilityTypes';
import { UtilityTypeTable } from '../../components/UtilityTypeTable';
import { useNotifications } from '@/contexts';
import { AppLayout } from '@/components/layout/AppLayout';
import { ROUTE_PATHS } from '@/constants/routes';
import type { PaginationOptions, UtilityTypeFilters } from '../../types';
import styles from './UtilityTypeListPage.module.scss';

export const UtilityTypeListPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: deleteUtilityType, loading: deleting } = useDeleteUtilityType();
  const { showError, showSuccess } = useNotifications();

  const [paginationOptions, setPaginationOptions] = useState<PaginationOptions>({
    page: 1,
    limit: 10
  });
  const [filters, setFilters] = useState<UtilityTypeFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, loading, refetch } = useUtilityTypes(paginationOptions, filters);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
      setPaginationOptions(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    setPaginationOptions(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this utility type?')) {
      try {
        await deleteUtilityType(id);
        showSuccess('Utility type deleted successfully');
        refetch();
      } catch (error) {
        showError('Failed to delete utility type');
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/utility-types/${id}/edit`);
  };

  return (
    <AppLayout>
      <div className={styles['page-container']}>
        <div className={styles['header-section']}>
          <PageHeader
            title="Utility Types"
            description="Manage utility types and their configurations"
            actions={
              <Button onClick={() => navigate('/admin/utility-types/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Utility Type
              </Button>
            }
          />
        </div>

        <div className={styles['filters-section']}>
          <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search utility types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <UtilityTypeTable
            data={response?.data || []}
            paginationInfo={response ? {
              total: response.total,
              page: response.page,
              limit: response.limit,
              totalPages: response.totalPages,
              hasNext: response.hasNext,
              hasPrev: response.hasPrev
            } : null}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleting={deleting}
          />
        )}
      </div>
    </AppLayout>
  );
};
