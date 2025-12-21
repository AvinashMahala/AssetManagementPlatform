import React from 'react';
import { FormColumn } from '@/componentDesignLibrary';
import { Upload } from 'lucide-react';
import type { PropertyInput } from '@/features/properties/types';
import PropertyFileUpload from '@/features/properties/components/forms/PropertyFileUpload';

interface FilesTabProps {
  files: PropertyInput['files'];
  onFilesChange: (files: PropertyInput['files']) => void;
}

const FilesTab: React.FC<FilesTabProps> = ({ files, onFilesChange }) => {
  return (
    <FormColumn
      title="Property Files"
      description="Upload photos and documents for the property"
      icon={<Upload className="h-5 w-5" />}
    >
      <PropertyFileUpload files={files || []} onFilesChange={onFilesChange} />
    </FormColumn>
  );
};

export default FilesTab;
