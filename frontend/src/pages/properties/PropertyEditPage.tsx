import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '../../utils/navigation';
import { useProperty, useUpdateProperty } from '../../hooks';
import PropertyFormModern from '../../components/forms/PropertyFormModern';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import type { PropertyInput } from '../../types';

const PropertyEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, loading: fetchLoading, error: fetchError, displayError: fetchDisplayError } = useProperty(id!);
  const { mutate: updateProperty, loading: updateLoading, error: updateError } = useUpdateProperty();

  if (fetchLoading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Card>
          <div className="animate-pulse p-6 space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (fetchError || !property) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">
            {fetchDisplayError || 'Property not found'}
          </p>
          <Button onClick={() => navigateBackOrFallback(navigate, '/properties')}>
            Back to Properties
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: PropertyInput) => {
    if (!id) return;
    try {
      await updateProperty({ id, data });
    } catch (error) {
      console.error('Failed to update property:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <PropertyFormModern
        initialData={property}
        onSubmit={handleSubmit}
        loading={updateLoading}
        isEdit={true}
        propertyName={property.name}
        apiError={updateError}
      />
    </div>
  );
};

export default PropertyEditPage;