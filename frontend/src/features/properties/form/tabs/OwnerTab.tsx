import React from 'react';
import { FormColumn } from '../../../../componentDesignLibrary';
import { User } from 'lucide-react';
import type { PropertyInput } from '../../../../types';
import type { FormErrors } from '../types';
import OwnerContactForm from '@/features/tenants/components/forms/OwnerContactForm';

interface OwnerTabProps {
  formData: PropertyInput;
  errors: FormErrors;
  onOwnerChange: (value: PropertyInput['ownerDetails']) => void;
  isEdit?: boolean;
}

const OwnerTab: React.FC<OwnerTabProps> = ({ formData, errors, onOwnerChange, isEdit }) => {
  return (
    <FormColumn
      title="Owner Contact Details"
      description="Property owner information and contact details"
      icon={<User className="h-5 w-5" />}
    >
      <OwnerContactForm
        value={formData.ownerDetails}
        onChange={(value) => onOwnerChange(value)}
        isEdit={!!isEdit}
        errors={{
          name: errors.ownerName,
          mobile: errors.ownerMobile,
          email: errors.ownerEmail
        }}
      />
    </FormColumn>
  );
};

export default OwnerTab;
