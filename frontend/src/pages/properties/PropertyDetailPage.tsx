import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty } from '../../hooks';
import { Card } from '../../components/common';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, loading, error } = useProperty(id!);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">
            {error || 'Property not found'}
          </p>
          <Button onClick={() => navigate('/properties')}>
            Back to Properties
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
          <p className="text-gray-600 mt-1">{property.description}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/properties/${id}/edit`)}
          >
            Edit Property
          </Button>
          <Button onClick={() => navigate('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>

      {/* Property Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Property Status</h2>
            <Badge
              variant={property.status === 'available' ? 'success' : 'secondary'}
            >
              {property.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Property Type</p>
            <p className="font-medium capitalize">{property.propertyType.replace('_', ' ')}</p>
          </div>
        </div>
      </Card>

      {/* Address */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Street Address</p>
            <p className="font-medium">{property.address.street}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">City</p>
            <p className="font-medium">{property.address.city}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">State</p>
            <p className="font-medium">{property.address.state}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ZIP Code</p>
            <p className="font-medium">{property.address.pincode}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Country</p>
            <p className="font-medium">India</p>
          </div>
        </div>
      </Card>

      {/* Property Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Property Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Area</p>
            <p className="text-lg font-medium">{property.totalArea.toLocaleString()} sq ft</p>
          </div>
          {property.totalFloors && (
            <div>
              <p className="text-sm text-gray-600">Total Floors</p>
              <p className="text-lg font-medium">{property.totalFloors}</p>
            </div>
          )}
          {property.yearBuilt && (
            <div>
              <p className="text-sm text-gray-600">Year Built</p>
              <p className="text-lg font-medium">{property.yearBuilt}</p>
            </div>
          )}
          {property.parkingSpaces && (
            <div>
              <p className="text-sm text-gray-600">Parking Spaces</p>
              <p className="text-lg font-medium">{property.parkingSpaces}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Amenities */}
      {property.buildingAmenities && property.buildingAmenities.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Building Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {property.buildingAmenities.map((amenity: string, index: number) => (
              <Badge key={index} variant="outline">
                {amenity}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Timestamps */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Property Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-medium">{formatDate(property.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="font-medium">{formatDate(property.updatedAt)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PropertyDetailPage;