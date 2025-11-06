import React from 'react';
import { useCreateUnit } from '../../hooks';
import UnitFormModern from '../../components/forms/UnitFormModern';
import type { UnitInput } from '../../types/unit';

export const UnitCreatePage: React.FC = () => {
  const { mutate: createUnit, loading } = useCreateUnit();

  const handleSubmit = async (data: UnitInput) => {
    await createUnit(data);
  };

  return (
    <UnitFormModern
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};
