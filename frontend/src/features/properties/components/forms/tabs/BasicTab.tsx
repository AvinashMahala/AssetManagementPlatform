import React from 'react';
import {
  FormColumn,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@/componentDesignLibrary';
import { Building2 } from 'lucide-react';
import type { PropertyInput } from '@/types';
import { PropertyType } from '@/features/properties/types';
import type { FormErrors } from '../types';

interface BasicTabProps {
  formData: PropertyInput;
  errors: FormErrors;
  users?: Array<any> | null;
  usersLoading?: boolean;
  onChange: (field: string, value: any) => void;
}

const BasicTab: React.FC<BasicTabProps> = ({ formData, errors, users, usersLoading, onChange }) => {
  return (
    <FormColumn
      title="Basic Information"
      description="Essential property details"
      icon={<Building2 className="h-5 w-5" />}
      className="xl:col-span-2"
    >
      <FormField label="Property Name" required>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          error={errors.name}
          placeholder="Enter property name"
          className="h-10"
        />
      </FormField>

      <FormField label="Property Type" required>
        <Select value={formData.propertyType} onValueChange={(value: string) => onChange('propertyType', value)}>
          <SelectTrigger error={errors.propertyType} className="h-10">
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            {(Object.values(PropertyType) as string[]).map(type => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Description">
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('description', e.target.value)}
          placeholder="Enter property description"
          rows={4}
          className="resize-none"
        />
      </FormField>

      <FormField label="Owner Name" required>
        <Select
          value={formData.ownerId || ''}
          onValueChange={(value: string) => {
            const selectedUser = users?.find(u => u.id === value);
            onChange('ownerId', value);
            if (selectedUser) {
              onChange('ownerDetails', {
                ...formData.ownerDetails,
                name: selectedUser.name || selectedUser.username || ''
              });
            }
          }}
          disabled={usersLoading}
        >
          <SelectTrigger error={errors.ownerId} className="h-10">
            <SelectValue placeholder={usersLoading ? 'Loading owners...' : 'Select owner'} />
          </SelectTrigger>
          <SelectContent>
            {users && users.length > 0 && users.map((user: any) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.username || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </FormColumn>
  );
};

export default BasicTab;
