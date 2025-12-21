import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../common/dialog';
import { Button } from '../common/button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

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

const variantConfig = {
  default: {
    icon: <Info className="h-6 w-6 text-blue-500" />,
    confirmVariant: 'default' as const,
  },
  destructive: {
    icon: <XCircle className="h-6 w-6 text-red-500" />,
    confirmVariant: 'destructive' as const,
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
    confirmVariant: 'default' as const,
  },
  success: {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    confirmVariant: 'default' as const,
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
  children
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-900 border shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {config.icon}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant={config.confirmVariant}
            className={config.confirmVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {loading ? 'Loading...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;