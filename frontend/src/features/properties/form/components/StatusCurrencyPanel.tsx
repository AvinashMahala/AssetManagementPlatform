import React from 'react';
import { FormColumn, FormField, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../componentDesignLibrary';
import { CheckCircle } from 'lucide-react';
import type { PropertyInput } from '../../../../types';
import { PropertyStatus } from '../../../../types/property';
import { getCurrencyOptions } from '../../../../types/currency';

interface StatusCurrencyPanelProps {
  status: PropertyInput['status'];
  currency: PropertyInput['currency'];
  onChange: (field: string, value: any) => void;
}

const StatusCurrencyPanel: React.FC<StatusCurrencyPanelProps> = ({ status, currency, onChange }) => {
  return (
    <FormColumn
      title="Property Status"
      description="Current status and currency"
      icon={<CheckCircle className="h-5 w-5" />}
    >
      <FormField label="Status" required>
        <Select value={status} onValueChange={(value: string) => onChange('status', value)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(PropertyStatus).map(statusValue => (
              <SelectItem key={statusValue} value={statusValue}>
                {statusValue.replace('_', ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Currency" required>
        <Select value={currency} onValueChange={(value: string) => onChange('currency', value)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {getCurrencyOptions().map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </FormColumn>
  );
};

export default StatusCurrencyPanel;
