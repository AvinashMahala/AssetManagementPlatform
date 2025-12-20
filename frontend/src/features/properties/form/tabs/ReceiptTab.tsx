import React from 'react';
import { FormColumn } from '../../../../componentDesignLibrary';
import { FileText } from 'lucide-react';
import type { PropertyReceiptTemplate } from '../../../../types';
import ReceiptTemplateForm from '@/features/finance/components/forms/ReceiptTemplateForm';

interface ReceiptTabProps {
  value: PropertyReceiptTemplate | Partial<PropertyReceiptTemplate>;
  onChange: (value: PropertyReceiptTemplate | Partial<PropertyReceiptTemplate>) => void;
}

const ReceiptTab: React.FC<ReceiptTabProps> = ({ value, onChange }) => {
  return (
    <FormColumn
      title="Receipt Template"
      description="Configure payment details and receipt settings"
      icon={<FileText className="h-5 w-5" />}
    >
      <ReceiptTemplateForm value={{ ...(value as any), propertyId: '' }} onChange={(v) => onChange(v)} />
    </FormColumn>
  );
};

export default ReceiptTab;
