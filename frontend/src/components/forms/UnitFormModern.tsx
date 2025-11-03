import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, DollarSign, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FormField } from '../../components/ui/form-field';
import { Badge } from '../../components/ui/badge';
import type { UnitInput } from '../../types/unit';
import { UnitStatus, UnitType, FurnishingType } from '../../types/unit';

interface UnitFormModernProps {
  initialData?: Partial<UnitInput>;
  onSubmit: (data: UnitInput) => Promise<void>;
  loading?: boolean;
  title?: string;
  properties?: Array<{ id: string; name: string }>;
}

const COMMON_AMENITIES = [
  'WiFi', 'AC', 'TV', 'Washing Machine', 'Microwave',
  'Fridge', 'Water Heater', 'Balcony', 'Parking', 'Security'
];

const UnitFormModern: React.FC<UnitFormModernProps> = ({
  initialData,
  onSubmit,
  loading,
  title = 'Create Unit',
  properties = []
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UnitInput>({
    propertyId: initialData?.propertyId || '',
    unitNumber: initialData?.unitNumber || '',
    floor: initialData?.floor || 0,
    unitType: initialData?.unitType || UnitType.TWO_BHK,
    status: initialData?.status || UnitStatus.AVAILABLE,
    carpetArea: initialData?.carpetArea || 0,
    builtUpArea: initialData?.builtUpArea || 0,
    bedrooms: initialData?.bedrooms || 2,
    bathrooms: initialData?.bathrooms || 2,
    balconies: initialData?.balconies || 1,
    furnishingType: initialData?.furnishingType || FurnishingType.SEMI_FURNISHED,
    rent: initialData?.rent || 0,
    securityDeposit: initialData?.securityDeposit || 0,
    maintenanceCharges: initialData?.maintenanceCharges || 0,
    amenities: initialData?.amenities || [],
    photos: initialData?.photos || [],
    availableFrom: initialData?.availableFrom || '',
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAmenity, setNewAmenity] = useState('');
  const [newPhoto, setNewPhoto] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities?.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev.amenities || []).filter(a => a !== amenity)
    }));
  };

  const handleAddPhoto = () => {
    if (newPhoto.trim() && !formData.photos?.includes(newPhoto.trim())) {
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), newPhoto.trim()]
      }));
      setNewPhoto('');
    }
  };

  const handleRemovePhoto = (photo: string) => {
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter(p => p !== photo)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId) newErrors.propertyId = 'Property is required';
    if (!formData.unitNumber.trim()) newErrors.unitNumber = 'Unit number is required';
    if (formData.carpetArea <= 0) newErrors.carpetArea = 'Carpet area must be greater than 0';
    if (formData.bedrooms < 0) newErrors.bedrooms = 'Bedrooms cannot be negative';
    if (formData.bathrooms < 0) newErrors.bathrooms = 'Bathrooms cannot be negative';
    if (formData.rent < 0) newErrors.rent = 'Rent cannot be negative';
    if (formData.securityDeposit < 0) newErrors.securityDeposit = 'Security deposit cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/units')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Units
        </Button>

        <div className="flex items-center gap-3">
          <Home className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">Add a new unit to a property</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Unit identification and basic details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Property" required>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) => handleChange('propertyId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.propertyId && (
                  <p className="text-sm text-red-600 mt-1">{errors.propertyId}</p>
                )}
              </FormField>

              <FormField label="Unit Number" required>
                <Input
                  value={formData.unitNumber}
                  onChange={(e) => handleChange('unitNumber', e.target.value)}
                  error={errors.unitNumber}
                  placeholder="e.g., 101, A-201"
                />
              </FormField>

              <FormField label="Floor">
                <Input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => handleChange('floor', Number(e.target.value))}
                  placeholder="Ground floor = 0"
                />
              </FormField>

              <FormField label="Unit Type" required>
                <Select
                  value={formData.unitType}
                  onValueChange={(value) => handleChange('unitType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UnitType.ONE_BHK}>1 BHK</SelectItem>
                    <SelectItem value={UnitType.TWO_BHK}>2 BHK</SelectItem>
                    <SelectItem value={UnitType.THREE_BHK}>3 BHK</SelectItem>
                    <SelectItem value={UnitType.FOUR_BHK}>4 BHK</SelectItem>
                    <SelectItem value={UnitType.STUDIO}>Studio</SelectItem>
                    <SelectItem value={UnitType.ROOM}>Room</SelectItem>
                    <SelectItem value={UnitType.SHOP}>Shop</SelectItem>
                    <SelectItem value={UnitType.OFFICE}>Office</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Status" required>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UnitStatus.AVAILABLE}>Available</SelectItem>
                    <SelectItem value={UnitStatus.OCCUPIED}>Occupied</SelectItem>
                    <SelectItem value={UnitStatus.UNDER_MAINTENANCE}>Under Maintenance</SelectItem>
                    <SelectItem value={UnitStatus.RESERVED}>Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Furnishing Type" required>
                <Select
                  value={formData.furnishingType}
                  onValueChange={(value) => handleChange('furnishingType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select furnishing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FurnishingType.FURNISHED}>Furnished</SelectItem>
                    <SelectItem value={FurnishingType.SEMI_FURNISHED}>Semi-Furnished</SelectItem>
                    <SelectItem value={FurnishingType.UNFURNISHED}>Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Area & Room Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Area & Room Details
            </CardTitle>
            <CardDescription>
              Physical specifications of the unit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Carpet Area (sq ft)" required>
                <Input
                  type="number"
                  value={formData.carpetArea}
                  onChange={(e) => handleChange('carpetArea', Number(e.target.value))}
                  error={errors.carpetArea}
                  min="0"
                />
              </FormField>

              <FormField label="Built-up Area (sq ft)">
                <Input
                  type="number"
                  value={formData.builtUpArea}
                  onChange={(e) => handleChange('builtUpArea', Number(e.target.value))}
                  min="0"
                />
              </FormField>

              <FormField label="Bedrooms" required>
                <Input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                  error={errors.bedrooms}
                  min="0"
                />
              </FormField>

              <FormField label="Bathrooms" required>
                <Input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                  error={errors.bathrooms}
                  min="0"
                />
              </FormField>

              <FormField label="Balconies">
                <Input
                  type="number"
                  value={formData.balconies}
                  onChange={(e) => handleChange('balconies', Number(e.target.value))}
                  min="0"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Details
            </CardTitle>
            <CardDescription>
              Rent and deposit information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Monthly Rent (₹)" required>
                <Input
                  type="number"
                  value={formData.rent}
                  onChange={(e) => handleChange('rent', Number(e.target.value))}
                  error={errors.rent}
                  min="0"
                />
              </FormField>

              <FormField label="Security Deposit (₹)" required>
                <Input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => handleChange('securityDeposit', Number(e.target.value))}
                  error={errors.securityDeposit}
                  min="0"
                />
              </FormField>

              <FormField label="Maintenance Charges (₹)">
                <Input
                  type="number"
                  value={formData.maintenanceCharges}
                  onChange={(e) => handleChange('maintenanceCharges', Number(e.target.value))}
                  min="0"
                />
              </FormField>
            </div>

            <FormField label="Available From">
              <Input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => handleChange('availableFrom', e.target.value)}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>
              Unit-specific amenities and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add amenity"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
              />
              <Button type="button" onClick={handleAddAmenity} variant="outline">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map(amenity => (
                <Badge
                  key={amenity}
                  variant={formData.amenities?.includes(amenity) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (formData.amenities?.includes(amenity)) {
                      handleRemoveAmenity(amenity);
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        amenities: [...(prev.amenities || []), amenity]
                      }));
                    }
                  }}
                >
                  {amenity}
                </Badge>
              ))}
            </div>

            {formData.amenities && formData.amenities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map(amenity => (
                    <Badge key={amenity} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveAmenity(amenity)}>
                      {amenity} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>
              Add photo URLs for the unit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newPhoto}
                onChange={(e) => setNewPhoto(e.target.value)}
                placeholder="Add photo URL"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPhoto())}
              />
              <Button type="button" onClick={handleAddPhoto} variant="outline">
                Add
              </Button>
            </div>

            {formData.photos && formData.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Unit photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Additional details about the unit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField label="Description">
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter unit description..."
                rows={4}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/units')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Unit'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UnitFormModern;