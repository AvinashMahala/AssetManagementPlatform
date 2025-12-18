import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty, useUpdateProperty } from '../../../hooks';
import navigateBackOrFallback from '../../../utils/navigation';
import PropertyFormTabbed from '../form/PropertyFormTabbed';
import { AppLayout } from '../../../components/layout/AppLayout';
import { Card, CardContent } from '../../../components/ui/card';
import type { PropertyInput } from '../../../types';

const PropertyEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, loading: fetchLoading } = useProperty(id!);
  const { mutate: updateProperty, loading: updateLoading, error: updateError } = useUpdateProperty();

  const handleSubmit = async (data: PropertyInput) => {
    if (!id) {
      return;
    }

    try {
      await updateProperty({ id, data });
      alert('Property updated successfully!');
      navigate(`/properties/${id}/dashboard`);
    } catch (error) {
      console.error('Failed to update property:', error);
      throw error; // Re-throw to let the form handle it
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
                  onClick={() => navigateBackOrFallback(navigate, '/properties')}
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
      <div className="py-8">
        <PropertyFormTabbed
          initialData={property}
          onSubmit={handleSubmit}
          loading={updateLoading}
          isEdit={true}
          propertyName={property?.name}
          propertyId={id}
          apiError={updateError}
        />
      </div>
    </AppLayout>
  );
};

export default PropertyEdit;