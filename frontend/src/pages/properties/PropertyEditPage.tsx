import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty, useUpdateProperty } from '../../hooks';
import { PropertyForm } from '../../components/forms/PropertyForm';
import { Card } from '../../components/common';
import { Button } from '../../components/common/Button';
import type { PropertyInput } from '../../types';

const PropertyEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, loading: fetchLoading, error: fetchError } = useProperty(id!);
  const { mutate: updateProperty, loading: updateLoading } = useUpdateProperty();

  const handleSubmit = async (data: PropertyInput) => {
    if (!id) return;
    await updateProperty({ id, data });
  };

  if (fetchLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (fetchError || !property) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">
            {fetchError || 'Property not found'}
          </p>
          <Button onClick={() => navigate('/properties')}>
            Back to Properties
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <PropertyForm
      initialData={property}
      onSubmit={handleSubmit}
      loading={updateLoading}
      title={`Edit Property: ${property.name}`}
      submitButtonText="Update Property"
    />
  );
};

export default PropertyEditPage;