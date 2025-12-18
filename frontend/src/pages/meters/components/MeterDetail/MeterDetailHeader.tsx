import React from 'react';
import { ArrowLeft, Edit, Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface MeterDetailHeaderProps {
  meterName: string;
  meterId: string;
  onBack: () => void;
  onEdit: () => void;
  onAddReading: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export const MeterDetailHeader: React.FC<MeterDetailHeaderProps> = ({
  meterName,
  meterId,
  onBack,
  onEdit,
  onAddReading,
  onDelete,
  deleting,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Meters
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{meterName}</h1>
          <p className="text-gray-600">Meter ID: {meterId}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Meter
        </Button>
        <Button
          variant="outline"
          onClick={onAddReading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reading
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={deleting}
        >
          Delete Meter
        </Button>
      </div>
    </div>
  );
};
