import React from 'react';
import { useCreateProperty } from '../../hooks';
import PropertyFormModern from '../../components/forms/PropertyFormModern';
import type { PropertyInput } from '../../types';

const PropertyCreatePage: React.FC = () => {
  const { mutate: createProperty, loading, error } = useCreateProperty();

  const handleSubmit = async (data: PropertyInput) => {
    try {
      await createProperty(data);
    } catch (err) {
      // Error is handled by the hook and passed to the form
      throw err;
    }
  };

  return (
    <PropertyFormModern
      onSubmit={handleSubmit}
      loading={loading}
      apiError={error}
    />
  );
};

export default PropertyCreatePage;