import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '../../../../utils/navigation';

interface MeterPageHeaderProps {
  title: string;
  subtitle?: string;
  backPath?: string;
}

export const MeterPageHeader: React.FC<MeterPageHeaderProps> = ({
  title,
  subtitle,
  backPath = '/meters'
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        onClick={() => navigateBackOrFallback(navigate, backPath)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Meters
      </Button>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>
    </div>
  );
};
