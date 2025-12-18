import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, BarChart3, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import type { PropertyActionsProps } from './types';

export const PropertyActions: React.FC<PropertyActionsProps> = ({
  propertyId,
  propertyName,
  onDelete,
  variant = 'card',
  className = ''
}) => {
  const navigate = useNavigate();

  if (variant === 'table') {
    return (
      <div className={`flex justify-end gap-2 ${className}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/properties/${propertyId}/rent-collection`)}
          title="Rent Collection"
        >
          <Receipt className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/properties/${propertyId}/dashboard`)}
          title="View Dashboard"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/properties/${propertyId}/edit`)}
          title="Edit Property"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(propertyId, propertyName)}
          title="Delete Property"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  }

  // Default to card variant
  return (
    <div className={`flex items-center gap-1 pt-1 mt-auto ${className}`}>
      <Button
        variant="default"
        size="sm"
        className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white flex-1"
        onClick={() => navigate(`/properties/${propertyId}/rent-collection`)}
        title="Rent Collection"
      >
        <Receipt className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="default"
        size="sm"
        className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white flex-1"
        onClick={() => navigate(`/properties/${propertyId}/dashboard`)}
        title="View Dashboard"
      >
        <BarChart3 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex-1"
        onClick={() => navigate(`/properties/${propertyId}/edit`)}
        title="Edit Property"
      >
        <Edit className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border-red-300 flex-1"
        onClick={() => onDelete(propertyId, propertyName)}
        title="Delete Property"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
