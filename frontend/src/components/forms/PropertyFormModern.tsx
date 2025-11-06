import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Home, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FormField } from '../../components/ui/form-field';
import { Badge } from '../../components/ui/badge';
import type { PropertyInput } from '../../types';
import { PropertyType, PropertyStatus } from '../../types/property';

interface PropertyFormModernProps {
  initialData?: Partial<PropertyInput>;
  onSubmit: (data: PropertyInput) => Promise<void>;
  loading?: boolean;
}

const AMENITIES = ['Parking', 'Lift', 'Security', 'Gym', 'Power Backup', 'Water Supply', 'Garden', 'Swimming Pool'];

const PropertyFormModern: React.FC<PropertyFormModernProps> = ({ initialData, onSubmit, loading }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PropertyInput>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    propertyType: initialData?.propertyType || PropertyType.APARTMENT,
    status: initialData?.status || PropertyStatus.AVAILABLE,
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      state: initialData?.address?.state || '',
      pincode: initialData?.address?.pincode || '',
      landmark: initialData?.address?.landmark || '',
    },
    totalArea: initialData?.totalArea || 0,
    totalFloors: initialData?.totalFloors || undefined,
    yearBuilt: initialData?.yearBuilt || undefined,
    parkingSpaces: initialData?.parkingSpaces || undefined,
    buildingAmenities: initialData?.buildingAmenities || [],
    buildingPhotos: initialData?.buildingPhotos || [],
    ownerId: initialData?.ownerId || '',
    coOwners: initialData?.coOwners || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAddressChange = (field: keyof PropertyInput['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      buildingAmenities: prev.buildingAmenities?.includes(amenity)
        ? prev.buildingAmenities.filter(a => a !== amenity)
        : [...(prev.buildingAmenities || []), amenity]
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Property name is required';
    if (!formData.address.street) newErrors.street = 'Street address is required';
    if (!formData.address.city) newErrors.city = 'City is required';
    if (!formData.address.state) newErrors.state = 'State is required';
    if (!formData.address.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.totalArea || formData.totalArea <= 0) newErrors.totalArea = 'Valid area is required';
    if (!formData.ownerId) newErrors.ownerId = 'Owner ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Page Header - Fixed, non-scrollable */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/properties')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Properties</span>
          </Button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Properties
              <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Create Property</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)] pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 3-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Basic Information */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>Essential property details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="Property Name" required>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      error={errors.name}
                      placeholder="Enter property name"
                      className="h-10"
                    />
                  </FormField>

                  <FormField label="Property Type" required>
                    <Select value={formData.propertyType} onValueChange={(value) => handleChange('propertyType', value)}>
                      <SelectTrigger error={errors.propertyType} className="h-10">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PropertyType).map(type => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Status" required>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PropertyStatus).map(status => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Owner ID" required>
                    <Input
                      id="ownerId"
                      value={formData.ownerId}
                      onChange={(e) => handleChange('ownerId', e.target.value)}
                      error={errors.ownerId}
                      placeholder="Enter owner ID"
                      className="h-10"
                    />
                  </FormField>

                  <FormField label="Description">
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Enter property description"
                      rows={4}
                      className="resize-none"
                    />
                  </FormField>
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Address Details */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5" />
                    Address Details
                  </CardTitle>
                  <CardDescription>Complete property location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="Street Address" required>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      error={errors.street}
                      placeholder="Enter street address"
                      className="h-10"
                    />
                  </FormField>

                  <FormField label="City" required>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      error={errors.city}
                      placeholder="Enter city"
                      className="h-10"
                    />
                  </FormField>

                  <FormField label="State" required>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      error={errors.state}
                      placeholder="Enter state"
                      className="h-10"
                    />
                  </FormField>

                  <FormField label="Pincode" required>
                    <Input
                      id="pincode"
                      value={formData.address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      error={errors.pincode}
                      placeholder="Enter pincode"
                      className="h-10"
                    />
                  </FormField>

                  <FormField label="Landmark">
                    <Input
                      id="landmark"
                      value={formData.address.landmark}
                      onChange={(e) => handleAddressChange('landmark', e.target.value)}
                      placeholder="Enter landmark (optional)"
                      className="h-10"
                    />
                  </FormField>
                </CardContent>
              </Card>
            </div>

            {/* Column 3: Specifications & Amenities */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Home className="h-5 w-5" />
                    Specifications
                  </CardTitle>
                  <CardDescription>Property specifications and amenities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="Total Area (sq ft)" required>
                    <Input
                      id="totalArea"
                      type="number"
                      value={formData.totalArea}
                      onChange={(e) => handleChange('totalArea', Number(e.target.value))}
                      error={errors.totalArea}
                      placeholder="Enter total area"
                      className="h-10"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Total Floors">
                      <Input
                        id="totalFloors"
                        type="number"
                        value={formData.totalFloors || ''}
                        onChange={(e) => handleChange('totalFloors', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Floors"
                        className="h-10"
                      />
                    </FormField>

                    <FormField label="Year Built">
                      <Input
                        id="yearBuilt"
                        type="number"
                        value={formData.yearBuilt || ''}
                        onChange={(e) => handleChange('yearBuilt', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Year"
                        className="h-10"
                      />
                    </FormField>
                  </div>

                  <FormField label="Parking Spaces">
                    <Input
                      id="parkingSpaces"
                      type="number"
                      value={formData.parkingSpaces || ''}
                      onChange={(e) => handleChange('parkingSpaces', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Enter parking spaces"
                      className="h-10"
                    />
                  </FormField>

                  <FormField label="Building Amenities">
                    <div className="grid grid-cols-2 gap-2">
                      {AMENITIES.map(amenity => (
                        <Badge
                          key={amenity}
                          variant={formData.buildingAmenities?.includes(amenity) ? 'default' : 'outline'}
                          className="cursor-pointer hover:bg-primary/80 transition-colors justify-center py-2 px-3 text-xs h-auto"
                          onClick={() => toggleAmenity(amenity)}
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </FormField>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Actions - Fixed at bottom */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/properties')}
              disabled={loading}
              className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Creating...' : 'Create Property'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModern;
