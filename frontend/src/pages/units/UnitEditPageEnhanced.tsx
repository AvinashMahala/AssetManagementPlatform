import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/card';
import { PageLoadingSpinner } from '../../componentDesignLibrary';
import { useUnit } from '../../hooks';
import { UnitEditPage } from './UnitEditPage';

const UnitEditPageEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loading } = useUnit(id!);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-20">
                <PageLoadingSpinner text="Loading unit..." />
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
        <UnitEditPage />
      </div>
    </AppLayout>
  );
};

export default UnitEditPageEnhanced;
