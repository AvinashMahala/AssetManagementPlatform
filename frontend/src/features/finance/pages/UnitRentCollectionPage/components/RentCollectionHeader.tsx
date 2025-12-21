import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import type { Property } from '@/features/properties/types';
import type { Unit } from '@/features/units/types';

interface RentCollectionHeaderProps {
  property?: Property;
  unit?: Unit;
  lastSavedAt: Date | null;
  billingPeriod: { start: string; end: string };
  propertyId: string;
}

export const RentCollectionHeader: React.FC<RentCollectionHeaderProps> = ({
  property,
  unit,
  lastSavedAt,
  billingPeriod,
  propertyId
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-start">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/properties/${propertyId}/rent-collection`)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Collect Rent</h1>
        <p className="mt-2 text-gray-600">
          {property?.name} - Unit {unit?.unitNumber}
        </p>
        {lastSavedAt && (
          <p className="text-xs text-green-600 mt-1">
            💾 Last saved at {lastSavedAt.toLocaleTimeString()}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Billing Period: {billingPeriod.start} to {billingPeriod.end}
        </p>
      </div>
    </div>
  );
};
