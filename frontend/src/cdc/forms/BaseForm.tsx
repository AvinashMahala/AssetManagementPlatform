import React from 'react';
import { FormLayout } from '../layouts/FormLayout';
import { FormGrid } from '../components/FormGrid';

interface BaseFormProps {
  // Layout props
  title: string;
  subtitle?: string;
  backLabel: string;
  onBack?: () => void;

  // Form props
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading?: boolean;
  cancelLabel?: string;
  submitLabel?: string;

  // Grid props
  gridGap?: 'sm' | 'md' | 'lg';
  gridClassName?: string;

  // Content
  children: React.ReactNode;

  // Additional styling
  className?: string;
}

export const BaseForm: React.FC<BaseFormProps> = ({
  title,
  subtitle,
  backLabel,
  onBack,
  onSubmit,
  onCancel,
  loading = false,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  gridGap = 'md',
  gridClassName = '',
  children,
  className = ''
}) => {
  return (
    <FormLayout
      title={title}
      subtitle={subtitle}
      backLabel={backLabel}
      onBack={onBack}
      onCancel={onCancel}
      loading={loading}
      cancelLabel={cancelLabel}
      submitLabel={submitLabel}
      className={className}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormGrid gap={gridGap} className={gridClassName}>
          {children}
        </FormGrid>
      </form>
    </FormLayout>
  );
};