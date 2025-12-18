import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '../../../../utils/navigation';

interface MeterErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  backPath?: string;
}

export const MeterError: React.FC<MeterErrorProps> = ({
  title = "Error",
  message = "An error occurred.",
  onRetry,
  backPath = '/meters'
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="error-icon text-4xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigateBackOrFallback(navigate, backPath)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meters
          </Button>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
