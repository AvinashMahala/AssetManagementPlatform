import React from 'react';
import { PropertyCard } from '../components/PropertyCard';
import type { Property } from '../../../types/property';

interface PropertyGridViewProps {
  properties: Property[];
  selectedProperties: Set<string>;
  onSelectProperty: (id: string, checked: boolean) => void;
  onDeleteClick: (id: string, name: string) => void;
}

const PropertyGridView: React.FC<PropertyGridViewProps> = ({
  properties,
  selectedProperties,
  onSelectProperty,
  onDeleteClick,
}) => {
  return (
    <div className="property-grid grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          isSelected={selectedProperties.has(property.id)}
          onSelect={onSelectProperty}
          onDelete={onDeleteClick}
          index={index}
        />
      ))}
    </div>
  );
};

export default PropertyGridView;
