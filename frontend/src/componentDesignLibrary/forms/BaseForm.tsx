import React, { useRef } from 'react';
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
  // Keep a reference to the form so the bottom action bar (outside the form)
  // can trigger a proper submit event
  const formRef = useRef<HTMLFormElement>(null);

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
      <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
        <FormGrid gap={gridGap} className={gridClassName}>
          {children}
        </FormGrid>
      </form>
    </FormLayout>
  );
};