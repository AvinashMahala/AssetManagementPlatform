import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Receipt, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { PropertyStatus, PropertyType } from '../../../types/property';
import type { Property } from '../../../types/property';

interface PropertyTableViewProps {
  properties: Property[];
  selectedProperties: Set<string>;
  onSelectProperty: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteClick: (id: string, name: string) => void;
}

const PropertyTableView: React.FC<PropertyTableViewProps> = ({
  properties,
  selectedProperties,
  onSelectProperty,
  onSelectAll,
  onDeleteClick,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case PropertyStatus.AVAILABLE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case PropertyStatus.OCCUPIED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case PropertyStatus.UNDER_MAINTENANCE:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case PropertyStatus.VACANT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [PropertyType.APARTMENT]: 'Apartment',
      [PropertyType.HOUSE]: 'House',
      [PropertyType.VILLA]: 'Villa',
      [PropertyType.COMMERCIAL]: 'Commercial',
      [PropertyType.PG_HOSTEL]: 'PG/Hostel',
      [PropertyType.CO_LIVING]: 'Co-Living',
      [PropertyType.OFFICE]: 'Office',
      [PropertyType.SHOP]: 'Shop',
      [PropertyType.WAREHOUSE]: 'Warehouse',
    };
    return labels[type] || type;
  };

  return (
    <div className="property-table-container">
      <Card>
        <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead className="w-12 py-2 px-3">
                    <input
                      type="checkbox"
                      className="header-checkbox rounded border-gray-300"
                      checked={selectedProperties.size === properties.length && properties.length > 0}
                      onChange={(e) => onSelectAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead className="w-[25%] min-w-[180px] py-2 px-3">Property Name</TableHead>
                  <TableHead className="w-[12%] min-w-[100px] py-2 px-3">Type</TableHead>
                  <TableHead className="w-[20%] min-w-[150px] py-2 px-3">Location</TableHead>
                  <TableHead className="w-[12%] min-w-[100px] py-2 px-3">Area (sq ft)</TableHead>
                  <TableHead className="w-[12%] min-w-[100px] py-2 px-3">Status</TableHead>
                  <TableHead className="w-[19%] min-w-[180px] py-2 px-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow
                    key={property.id}
                    className={`table-row ${
                      property.status === PropertyStatus.AVAILABLE
                        ? 'bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30'
                        : ''
                    }`}
                  >
                    <TableCell className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="row-checkbox rounded border-gray-300"
                        checked={selectedProperties.has(property.id)}
                        onChange={(e) => onSelectProperty(property.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium break-words py-2 px-3">
                      <button
                        className="property-name-link text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
                        onClick={() => navigate(`/properties/${property.id}/dashboard`)}
                      >
                        {property.name}
                      </button>
                    </TableCell>
                    <TableCell className="break-words py-2 px-3">
                      <Badge variant="outline" className="whitespace-normal text-xs">
                        {getTypeLabel(property.propertyType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="break-words py-2 px-3">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="break-words text-sm">{property.address.city}, {property.address.state}</span>
                      </div>
                    </TableCell>
                    <TableCell className="break-words py-2 px-3 text-sm">
                      {property.totalArea ? property.totalArea.toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell className="break-words py-2 px-3">
                      <Badge className={`${getStatusColor(property.status)} whitespace-normal text-xs`}>
                        {property.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-2 px-3">
                      <div className="table-actions flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="table-action-button"
                          onClick={() => navigate(`/properties/${property.id}/rent-collection`)}
                          title="Rent Collection"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="table-action-button"
                          onClick={() => navigate(`/properties/${property.id}/dashboard`)}
                          title="View Dashboard"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="table-action-button"
                          onClick={() => navigate(`/properties/${property.id}/edit`)}
                          title="Edit Property"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="table-action-button"
                          onClick={() => onDeleteClick(property.id, property.name)}
                          title="Delete Property"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyTableView;