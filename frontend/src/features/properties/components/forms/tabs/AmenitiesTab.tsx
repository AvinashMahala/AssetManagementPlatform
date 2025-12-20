import React from 'react';
import { FormColumn } from '@/componentDesignLibrary';
import { Star } from 'lucide-react';
import type { PropertyInput } from '@/types';
import EnhancedAmenitiesForm from '@/features/properties/components/forms/EnhancedAmenitiesForm';

interface AmenitiesTabProps {
  value: PropertyInput['amenities'];
  onChange: (value: PropertyInput['amenities']) => void;
}

const AmenitiesTab: React.FC<AmenitiesTabProps> = ({ value, onChange }) => {
  return (
    <FormColumn
      title="Enhanced Amenities"
      description="Basic and luxury amenities with additional property rules"
      icon={<Star className="h-5 w-5" />}
    >
      <EnhancedAmenitiesForm value={value || { basic: [], luxury: [], additionalInfo: { petFriendly: false, smokingAllowed: false, eventsAllowed: false } }} onChange={onChange} />
    </FormColumn>
  );
};

export default AmenitiesTab;
