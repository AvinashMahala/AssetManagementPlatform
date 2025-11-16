import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../../components/ui/input';
import { PropertyType, PropertyStatus } from '../../types';
import type { PropertyInput, PropertyAddress } from '../../types';

interface PropertyFormProps {
  initialData?: Partial<PropertyInput>;
  onSubmit: (data: PropertyInput) => Promise<void>;
  loading?: boolean;
  title: string;
  submitButtonText: string;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  title,
  submitButtonText
}) => {
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
      country: initialData?.address?.country || 'India',
      landmark: initialData?.address?.landmark || ''
    },
    totalArea: initialData?.totalArea || 0,
    totalFloors: initialData?.totalFloors || 1,
    yearBuilt: initialData?.yearBuilt,
    parkingSpaces: initialData?.parkingSpaces || 0,
    buildingAmenities: initialData?.buildingAmenities || [],
    buildingPhotos: initialData?.buildingPhotos || [],
    ownerDetails: initialData?.ownerDetails || {
      name: '',
      mobileNumbers: [''],
      emailIds: [''],
      website: ''
    },
    amenities: initialData?.amenities || {
      basic: [],
      luxury: [],
      additionalInfo: {
        petFriendly: false,
        smokingAllowed: false,
        eventsAllowed: false
      }
    },
    files: initialData?.files || [],
    receiptTemplate: initialData?.receiptTemplate || {
      bankDetails: {
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: ''
      },
      wallets: [],
      additionalInfo: {}
    },
    ownerId: initialData?.ownerId || 'current-user-id', // This should come from auth context
    coOwners: initialData?.coOwners || []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PropertyInput | keyof PropertyAddress, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [newAmenity, setNewAmenity] = useState<string>('');

  const propertyTypeOptions = Object.values(PropertyType).map(type => ({
    value: type,
    label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  const statusOptions = Object.values(PropertyStatus).map(status => ({
    value: status,
    label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  const commonAmenities = [
    'Parking', 'Security', 'Lift', 'Power Backup', 'Water Supply',
    'Garden', 'Gym', 'Swimming Pool', 'Play Area', 'Intercom',
    'CCTV', 'WiFi', 'Laundry', 'Housekeeping'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PropertyInput | keyof PropertyAddress, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    if (!formData.address.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.address.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (formData.totalArea <= 0) {
      newErrors.totalArea = 'Total area must be greater than 0';
    }

    if (formData.totalFloors && formData.totalFloors <= 0) {
      newErrors.totalFloors = 'Total floors must be greater than 0';
    }

    if (formData.yearBuilt && (formData.yearBuilt < 1800 || formData.yearBuilt > new Date().getFullYear())) {
      newErrors.yearBuilt = 'Please enter a valid year';
    }

    if (formData.parkingSpaces && formData.parkingSpaces < 0) {
      newErrors.parkingSpaces = 'Parking spaces cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      navigate('/properties');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleInputChange = (field: keyof PropertyInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'totalArea' || field === 'totalFloors' || field === 'yearBuilt' || field === 'parkingSpaces'
        ? (value === '' ? undefined : Number(value))
        : value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAddressChange = (field: keyof PropertyAddress) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      buildingAmenities: prev.buildingAmenities?.includes(amenity)
        ? prev.buildingAmenities.filter(a => a !== amenity)
        : [...(prev.buildingAmenities || []), amenity]
    }));
  };

  const handleAddCustomAmenity = () => {
    if (newAmenity.trim() && !(formData.buildingAmenities || []).includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        buildingAmenities: [...(prev.buildingAmenities || []), newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      buildingAmenities: (prev.buildingAmenities || []).filter(a => a !== amenity)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">Fill in the property details below</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {submitError}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              value={formData.name}
              onChange={handleInputChange('name')}
              error={errors.name}
              placeholder="Enter property name"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.propertyType}
                onChange={handleInputChange('propertyType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {propertyTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={handleInputChange('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter property description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={handleInputChange('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                value={formData.address.street}
                onChange={handleAddressChange('street')}
                error={errors.street}
                placeholder="Enter street address"
                required
              />

              <Input
                value={formData.address.landmark}
                onChange={handleAddressChange('landmark')}
                placeholder="Enter nearby landmark"
              />

              <Input
                value={formData.address.city}
                onChange={handleAddressChange('city')}
                error={errors.city}
                placeholder="Enter city"
                required
              />

              <Input
                value={formData.address.state}
                onChange={handleAddressChange('state')}
                error={errors.state}
                placeholder="Enter state"
                required
              />

              <Input
                value={formData.address.pincode}
                onChange={handleAddressChange('pincode')}
                error={errors.pincode}
                placeholder="Enter 6-digit pincode"
                required
              />
            </div>
          </div>

          {/* Building Specifications */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Building Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                value={formData.totalArea || ''}
                onChange={handleInputChange('totalArea')}
                error={errors.totalArea}
                placeholder="Enter total area"
                required
              />

              <Input
                type="number"
                value={formData.totalFloors || ''}
                onChange={handleInputChange('totalFloors')}
                error={errors.totalFloors}
                placeholder="Enter total floors"
              />

              <Input
                type="number"
                value={formData.yearBuilt || ''}
                onChange={handleInputChange('yearBuilt')}
                error={errors.yearBuilt}
                placeholder="Enter year built"
              />

              <Input
                type="number"
                value={formData.parkingSpaces || ''}
                onChange={handleInputChange('parkingSpaces')}
                error={errors.parkingSpaces}
                placeholder="Enter number of parking spaces"
              />
            </div>
          </div>

          {/* Building Amenities */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Building Amenities</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonAmenities.map(amenity => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(formData.buildingAmenities || []).includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="mr-2"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add custom amenity"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAmenity())}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddCustomAmenity}
                  disabled={!newAmenity.trim()}
                >
                  Add
                </Button>
              </div>

              {(formData.buildingAmenities || []).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(formData.buildingAmenities || []).map(amenity => (
                      <span
                        key={amenity}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(amenity)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/properties')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : submitButtonText}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};