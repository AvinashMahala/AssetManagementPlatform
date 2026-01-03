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
        {AMENITIES.map(amenity => {
          const isSelected = selected?.includes(amenity);
          return (
            <div key={amenity} className="inline-block">
              <Badge
                variant="outline"
                className={`cursor-pointer hover:bg-primary/80 transition-colors justify-center py-2 px-3 text-xs h-auto ${isSelected ? 'border-2 border-green-500 bg-green-50 text-green-700' : ''}`}
                onClick={() => onToggle(amenity)}
              >
                {amenity}
              </Badge>
            </div>
          );
        })}
      </div>
    </FormField>
  );
};

export default BuildingAmenities;
