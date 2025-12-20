import React from 'react';
import { FormColumn, FormField, Input } from '@/componentDesignLibrary';
import { MapPin } from 'lucide-react';
import type { FormErrors } from '../types';
import type { PropertyInput } from '@/types';

interface AddressTabProps {
  formData: PropertyInput;
  errors: FormErrors;
  onAddressChange: (field: string, value: string) => void;
}

const AddressTab: React.FC<AddressTabProps> = ({ formData, errors, onAddressChange }) => {
  return (
    <>
      <FormColumn
        title="Street & City"
        description="Primary address details"
        icon={<MapPin className="h-5 w-5" />}
      >
        <FormField label="Street Address" required>
          <Input
            id="street"
            value={formData.address.street}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAddressChange('street', e.target.value)}
            error={errors.street}
            placeholder="Enter street address"
            className="h-10"
          />
        </FormField>

        <FormField label="City" required>
          <Input
            id="city"
            value={formData.address.city}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAddressChange('city', e.target.value)}
            error={errors.city}
            placeholder="Enter city"
            className="h-10"
          />
        </FormField>
      </FormColumn>

      <FormColumn
        title="State & Pincode"
        description="Location identifiers"
        icon={<MapPin className="h-5 w-5" />}
      >
        <FormField label="State" required>
          <Input
            id="state"
            value={formData.address.state}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAddressChange('state', e.target.value)}
            error={errors.state}
            placeholder="Enter state"
            className="h-10"
          />
        </FormField>

        <FormField label="Pincode" required>
          <Input
            id="pincode"
            value={formData.address.pincode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAddressChange('pincode', e.target.value)}
            error={errors.pincode}
            placeholder="Enter pincode"
            className="h-10"
          />
        </FormField>
      </FormColumn>

      <FormColumn
        title="Country & Landmark"
        description="Additional location details"
        icon={<MapPin className="h-5 w-5" />}
      >
        <FormField label="Country">
          <Input
            id="country"
            value={formData.address.country}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAddressChange('country', e.target.value)}
            placeholder="Enter country"
            className="h-10"
          />
        </FormField>

        <FormField label="Landmark">
          <Input
            id="landmark"
            value={formData.address.landmark}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAddressChange('landmark', e.target.value)}
            placeholder="Enter landmark (optional)"
            className="h-10"
          />
        </FormField>
      </FormColumn>
    </>
  );
};

export default AddressTab;
