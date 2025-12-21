import React from 'react';
import { Badge, FormField } from '@/componentDesignLibrary';
import { AMENITIES } from '../constants';

interface BuildingAmenitiesProps {
  selected: string[] | undefined;
  onToggle: (amenity: string) => void;
}

const BuildingAmenities: React.FC<BuildingAmenitiesProps> = ({ selected, onToggle }) => {
  return (
    <FormField label="Building Amenities">
      <div className="grid grid-cols-2 gap-2">
        {AMENITIES.map(amenity => (
          <Badge
            key={amenity}
            variant={selected?.includes(amenity) ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/80 transition-colors justify-center py-2 px-3 text-xs h-auto"
            onClick={() => onToggle(amenity)}
          >
            {amenity}
          </Badge>
        ))}
      </div>
    </FormField>
  );
};

export default BuildingAmenities;
