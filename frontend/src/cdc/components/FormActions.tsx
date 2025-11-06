import React from 'react';
import { Button } from '../../components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  loading?: boolean;
  cancelLabel?: string;
  submitLabel?: string;
  cancelDisabled?: boolean;
  submitDisabled?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  loading = false,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  cancelDisabled = false,
  submitDisabled = false
}) => {
  return (
    <div className="flex-shrink-0 flex justify-end gap-4 pt-4 pb-2 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={loading || cancelDisabled}
        className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        disabled={loading || submitDisabled}
        className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={onSubmit}
      >
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
};