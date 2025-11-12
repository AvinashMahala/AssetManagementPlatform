import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { FormActions } from '../components/FormActions';

interface FormLayoutProps {
  // Header props
  title: string;
  subtitle?: string;
  backLabel: string;
  onBack?: () => void;

  // Content props
  children: React.ReactNode;

  // Actions props
  onCancel: () => void;
  loading?: boolean;
  cancelLabel?: string;
  submitLabel?: string;
  cancelDisabled?: boolean;
  submitDisabled?: boolean;

  // Layout props
  className?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  title,
  subtitle,
  backLabel,
  onBack,
  children,
  onCancel,
  loading = false,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  cancelDisabled = false,
  submitDisabled = false,
  className = ''
}) => {
  return (
    <div className={`min-h-screen max-h-screen flex flex-col ${className}`}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        backLabel={backLabel}
        onBack={onBack}
      />

      {/* Scrollable Form Content - Takes remaining space */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4">
        {children}
      </div>

      <FormActions
        onCancel={onCancel}
        loading={loading}
        cancelLabel={cancelLabel}
        submitLabel={submitLabel}
        cancelDisabled={cancelDisabled}
        submitDisabled={submitDisabled}
      />
    </div>
  );
};