import React from 'react';
import { FormColumn, FormField, Input } from '../../../../componentDesignLibrary';
import BuildingAmenities from '../components/BuildingAmenities';
import { Home } from 'lucide-react';
import type { PropertyInput } from '../../../../types';
import type { FormErrors } from '../types';
// AMENITIES moved to BuildingAmenities component

interface DetailsTabProps {
  formData: PropertyInput;
  errors: FormErrors;
  onChange: (field: string, value: any) => void;
  toggleAmenity: (amenity: string) => void;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ formData, errors, onChange, toggleAmenity }) => {
  return (
    <>
      <FormColumn
        title="Area & Floors"
        description="Physical property specifications"
        icon={<Home className="h-5 w-5" />}
      >
        <FormField label="Total Area (sq ft)" required>
          <Input
            id="totalArea"
            type="number"
            value={formData.totalArea || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('totalArea', parseFloat(e.target.value) || 0)}
            error={errors.totalArea}
            placeholder="Enter total area"
            className="h-10"
          />
        </FormField>

        <FormField label="Total Floors">
          <Input
            id="totalFloors"
            type="number"
            value={formData.totalFloors || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('totalFloors', parseInt(e.target.value) || undefined)}
            placeholder="Enter total floors"
            className="h-10"
          />
        </FormField>
      </FormColumn>

      <FormColumn
        title="Construction & Parking"
        description="Building details"
        icon={<Home className="h-5 w-5" />}
      >
        <FormField label="Year Built">
          <Input
            id="yearBuilt"
            type="number"
            value={formData.yearBuilt || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('yearBuilt', parseInt(e.target.value) || undefined)}
            placeholder="Enter year built"
            className="h-10"
          />
        </FormField>

        <FormField label="Parking Spaces">
          <Input
            id="parkingSpaces"
            type="number"
            value={formData.parkingSpaces || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('parkingSpaces', parseInt(e.target.value) || undefined)}
            placeholder="Enter parking spaces"
            className="h-10"
          />
        </FormField>
      </FormColumn>

      <FormColumn
        title="Building Amenities"
        description="Available facilities"
        icon={<Home className="h-5 w-5" />}
        className="xl:col-span-2"
      >
        <BuildingAmenities selected={formData.buildingAmenities} onToggle={toggleAmenity} />
      </FormColumn>
    </>
  );
};

export default DetailsTab;
