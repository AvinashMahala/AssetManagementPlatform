import React from 'react';
import { Button } from '../../components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  loading?: boolean;
  cancelLabel?: string;
  submitLabel?: string;
  cancelDisabled?: boolean;
  submitDisabled?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
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
        type="button"
        disabled={loading || submitDisabled}
        className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => {
          // Find the form with the specific class used by BaseForm
          const form = document.querySelector('form.space-y-4') as HTMLFormElement;

          if (form) {
            try {
              form.requestSubmit();
            } catch (error) {
              // Fallback: dispatch submit event
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
              form.dispatchEvent(submitEvent);
            }
          } else {
            // Fallback: try any form
            const anyForm = document.querySelector('form') as HTMLFormElement;
            if (anyForm) {
              anyForm.requestSubmit();
            }
          }
        }}
      >
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
};