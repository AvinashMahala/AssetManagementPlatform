import React from 'react';
import { Home, Crown, Settings, Plus, X } from 'lucide-react';
import { FormField, Badge, Button, Textarea } from '@/componentDesignLibrary';
import type { PropertyAmenities } from '@/features/properties/types';

interface EnhancedAmenitiesFormProps {
  value: PropertyAmenities;
  onChange: (value: PropertyAmenities) => void;
}

const BASIC_AMENITIES = [
  'Parking', 'Lift', 'Security', 'Power Backup', 'Water Supply',
  'Garden', 'Maintenance Staff', 'Intercom', 'CCTV', 'WiFi'
];

const LUXURY_AMENITIES = [
  'Swimming Pool', 'Gym', 'Spa', 'Jacuzzi', 'Tennis Court',
  'Basketball Court', 'Playground', 'Club House', 'Theater',
  'Concierge Service', 'Laundry Service', 'Housekeeping'
];

const EnhancedAmenitiesForm: React.FC<EnhancedAmenitiesFormProps> = ({ value, onChange }) => {
  const handleChange = (field: keyof PropertyAmenities, fieldValue: any) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const toggleBasicAmenity = (amenity: string) => {
    const current = value.basic || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    handleChange('basic', updated);
  };

  const toggleLuxuryAmenity = (amenity: string) => {
    const current = value.luxury || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    handleChange('luxury', updated);
  };

  const handleAdditionalInfoChange = (field: keyof PropertyAmenities['additionalInfo'], fieldValue: any) => {
    handleChange('additionalInfo', {
      ...value.additionalInfo,
      [field]: fieldValue
    });
  };

  const addCustomBasicAmenity = (amenity: string) => {
    if (amenity.trim() && !value.basic.includes(amenity.trim())) {
      handleChange('basic', [...value.basic, amenity.trim()]);
    }
  };

  const addCustomLuxuryAmenity = (amenity: string) => {
    if (amenity.trim() && !value.luxury.includes(amenity.trim())) {
      handleChange('luxury', [...value.luxury, amenity.trim()]);
    }
  };

  const removeBasicAmenity = (amenity: string) => {
    handleChange('basic', value.basic.filter(a => a !== amenity));
  };

  const removeLuxuryAmenity = (amenity: string) => {
    handleChange('luxury', value.luxury.filter(a => a !== amenity));
  };

  return (
    <div className="space-y-6">
      {/* Basic Amenities */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Basic Amenities</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {BASIC_AMENITIES.map(amenity => (
            <Badge
              key={amenity}
              variant={value.basic?.includes(amenity) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-blue-50 transition-colors justify-center py-2 px-3 text-xs h-auto"
              onClick={() => toggleBasicAmenity(amenity)}
            >
              {amenity}
            </Badge>
          ))}
        </div>

        {/* Custom Basic Amenities */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Custom Basic Amenities</label>
          <div className="flex flex-wrap gap-2">
            {value.basic?.filter(amenity => !BASIC_AMENITIES.includes(amenity)).map(amenity => (
              <Badge
                key={amenity}
                variant="secondary"
                className="flex items-center gap-1 py-1 px-2 text-xs"
              >
                {amenity}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() => removeBasicAmenity(amenity)}
                />
              </Badge>
            ))}
          </div>
          <CustomAmenityInput onAdd={addCustomBasicAmenity} placeholder="Add custom basic amenity" />
        </div>
      </div>

      {/* Luxury Amenities */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">Luxury Amenities</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {LUXURY_AMENITIES.map(amenity => (
            <Badge
              key={amenity}
              variant={value.luxury?.includes(amenity) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-purple-50 transition-colors justify-center py-2 px-3 text-xs h-auto"
              onClick={() => toggleLuxuryAmenity(amenity)}
            >
              {amenity}
            </Badge>
          ))}
        </div>

        {/* Custom Luxury Amenities */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Custom Luxury Amenities</label>
          <div className="flex flex-wrap gap-2">
            {value.luxury?.filter(amenity => !LUXURY_AMENITIES.includes(amenity)).map(amenity => (
              <Badge
                key={amenity}
                variant="secondary"
                className="flex items-center gap-1 py-1 px-2 text-xs"
              >
                {amenity}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() => removeLuxuryAmenity(amenity)}
                />
              </Badge>
            ))}
          </div>
          <CustomAmenityInput onAdd={addCustomLuxuryAmenity} placeholder="Add custom luxury amenity" />
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Pet Friendly">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="petFriendly"
                checked={value.additionalInfo?.petFriendly || false}
                onChange={(e) => handleAdditionalInfoChange('petFriendly', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="petFriendly" className="text-sm text-gray-700">
                Pets allowed
              </label>
            </div>
          </FormField>

          <FormField label="Smoking Allowed">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="smokingAllowed"
                checked={value.additionalInfo?.smokingAllowed || false}
                onChange={(e) => handleAdditionalInfoChange('smokingAllowed', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="smokingAllowed" className="text-sm text-gray-700">
                Smoking permitted
              </label>
            </div>
          </FormField>

          <FormField label="Events Allowed">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="eventsAllowed"
                checked={value.additionalInfo?.eventsAllowed || false}
                onChange={(e) => handleAdditionalInfoChange('eventsAllowed', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="eventsAllowed" className="text-sm text-gray-700">
                Events permitted
              </label>
            </div>
          </FormField>
        </div>

        <FormField label="Custom Rules & Restrictions">
          <Textarea
            value={value.additionalInfo?.customRules || ''}
            onChange={(e) => handleAdditionalInfoChange('customRules', e.target.value)}
            placeholder="Enter any additional rules or restrictions for tenants..."
            rows={3}
            className="resize-none"
          />
        </FormField>
      </div>
    </div>
  );
};

// Helper component for adding custom amenities
interface CustomAmenityInputProps {
  onAdd: (amenity: string) => void;
  placeholder: string;
}

const CustomAmenityInput: React.FC<CustomAmenityInputProps> = ({ onAdd, placeholder }) => {
  const [input, setInput] = React.useState('');

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        disabled={!input.trim()}
        className="flex items-center gap-1"
      >
        <Plus className="h-3 w-3" />
        Add
      </Button>
    </div>
  );
};

export default EnhancedAmenitiesForm;