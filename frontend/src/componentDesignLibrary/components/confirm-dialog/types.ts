export type ConfirmDialogVariant = 'default' | 'destructive' | 'warning' | 'success';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  children?: React.ReactNode;
}