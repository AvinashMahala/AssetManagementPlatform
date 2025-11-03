import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/card';
import { useTenant } from '../../hooks';
import TenantEditPage from './TenantEditPage';

const TenantEditPageEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loading } = useTenant(id!);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <TenantEditPage />
      </div>
    </AppLayout>
  );
};

export default TenantEditPageEnhanced;
