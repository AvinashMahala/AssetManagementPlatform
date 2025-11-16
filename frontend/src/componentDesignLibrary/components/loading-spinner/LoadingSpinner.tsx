import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

export function LoadingSpinner({
  size = 'md',
  className = '',
  text,
  fullScreen = false,
  overlay = false
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Convenience components for common use cases
export function PageLoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function InlineLoadingSpinner({ size = 'sm', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) {
  return <LoadingSpinner size={size} className={className} />;
}

export function ButtonLoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return <LoadingSpinner size={size} />;
}

export default LoadingSpinner;