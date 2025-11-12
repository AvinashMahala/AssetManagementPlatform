import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty, useUpdateProperty } from '../../hooks';
import PropertyFormModern from '../../components/forms/PropertyFormModern';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/card';
import type { PropertyInput } from '../../types';

const PropertyEditPageEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, loading: fetchLoading } = useProperty(id!);
  const { mutate: updateProperty, loading: updateLoading } = useUpdateProperty();

  const handleSubmit = async (data: PropertyInput) => {
    if (!id) {
      return;
    }

    try {
      const response = await updateProperty({ id, data });

      if (!response.success) {
        const errorMessage = response.error?.message || 'Failed to update property';
        alert(`Error: ${errorMessage}`);
        return;
      }

      alert('Property updated successfully!');
      navigate(`/properties/${id}/dashboard`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      alert(`Error: ${errorMessage}`);
    }
  };

  if (fetchLoading) {
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

  if (!property) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  Property Not Found
                </h3>
                <p className="text-muted-foreground mb-4">
                  The property you're trying to edit could not be found.
                </p>
                <button
                  onClick={() => navigate('/properties')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Back to Properties
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PropertyFormModern
        initialData={property}
        onSubmit={handleSubmit}
        loading={updateLoading}
        isEdit={true}
        propertyName={property.name}
      />
    </AppLayout>
  );
};

export default PropertyEditPageEnhanced;
