import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateUnit, useProperties } from '../../hooks';
import type { UnitInput } from '../../types/unit';
import { UnitStatus, UnitType, FurnishingType } from '../../types/unit';

export const UnitCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createUnit, loading, error } = useCreateUnit();
  const { properties } = useProperties();
  const [formData, setFormData] = useState<UnitInput>({
    propertyId: '',
    unitNumber: '',
    floor: 0,
    unitType: UnitType.TWO_BHK,
    status: UnitStatus.AVAILABLE,
    carpetArea: 0,
    builtUpArea: 0,
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    furnishingType: FurnishingType.SEMI_FURNISHED,
    rent: 0,
    securityDeposit: 0,
    maintenanceCharges: 0,
    amenities: [],
    photos: [],
    availableFrom: '',
    description: '',
  });

  const [amenityInput, setAmenityInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['floor', 'carpetArea', 'builtUpArea', 'bedrooms', 'bathrooms', 'balconies', 'rent', 'securityDeposit', 'maintenanceCharges'].includes(name)
        ? Number(value)
        : value
    }));
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev.amenities || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), photoInput.trim()]
      }));
      setPhotoInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUnit(formData);
      navigate('/units');
    } catch (err) {
      console.error('Failed to create unit:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Unit</h1>
        <p className="mt-2 text-gray-600">Add a new unit to a property</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        {/* Property Selection */}
        <div>
          <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">
            Property *
          </label>
          <select
            id="propertyId"
            name="propertyId"
            value={formData.propertyId}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a property</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="unitNumber" className="block text-sm font-medium text-gray-700">
              Unit Number *
            </label>
            <input
              type="text"
              id="unitNumber"
              name="unitNumber"
              value={formData.unitNumber}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
              Floor
            </label>
            <input
              type="number"
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="unitType" className="block text-sm font-medium text-gray-700">
              Unit Type *
            </label>
            <select
              id="unitType"
              name="unitType"
              value={formData.unitType}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={UnitType.ONE_BHK}>1 BHK</option>
              <option value={UnitType.TWO_BHK}>2 BHK</option>
              <option value={UnitType.THREE_BHK}>3 BHK</option>
              <option value={UnitType.FOUR_BHK}>4 BHK</option>
              <option value={UnitType.STUDIO}>Studio</option>
              <option value={UnitType.ROOM}>Room</option>
              <option value={UnitType.SHOP}>Shop</option>
              <option value={UnitType.OFFICE}>Office</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={UnitStatus.AVAILABLE}>Available</option>
              <option value={UnitStatus.OCCUPIED}>Occupied</option>
              <option value={UnitStatus.UNDER_MAINTENANCE}>Under Maintenance</option>
              <option value={UnitStatus.RESERVED}>Reserved</option>
            </select>
          </div>
        </div>

        {/* Area Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="carpetArea" className="block text-sm font-medium text-gray-700">
              Carpet Area (sq ft) *
            </label>
            <input
              type="number"
              id="carpetArea"
              name="carpetArea"
              value={formData.carpetArea}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="builtUpArea" className="block text-sm font-medium text-gray-700">
              Built-up Area (sq ft)
            </label>
            <input
              type="number"
              id="builtUpArea"
              name="builtUpArea"
              value={formData.builtUpArea}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Room Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
              Bedrooms *
            </label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
              Bathrooms *
            </label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="balconies" className="block text-sm font-medium text-gray-700">
              Balconies
            </label>
            <input
              type="number"
              id="balconies"
              name="balconies"
              value={formData.balconies}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Furnishing */}
        <div>
          <label htmlFor="furnishingType" className="block text-sm font-medium text-gray-700">
            Furnishing Type *
          </label>
          <select
            id="furnishingType"
            name="furnishingType"
            value={formData.furnishingType}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={FurnishingType.FURNISHED}>Furnished</option>
            <option value={FurnishingType.SEMI_FURNISHED}>Semi-Furnished</option>
            <option value={FurnishingType.UNFURNISHED}>Unfurnished</option>
          </select>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="rent" className="block text-sm font-medium text-gray-700">
              Rent (₹/month) *
            </label>
            <input
              type="number"
              id="rent"
              name="rent"
              value={formData.rent}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700">
              Security Deposit (₹) *
            </label>
            <input
              type="number"
              id="securityDeposit"
              name="securityDeposit"
              value={formData.securityDeposit}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="maintenanceCharges" className="block text-sm font-medium text-gray-700">
              Maintenance Charges (₹/month)
            </label>
            <input
              type="number"
              id="maintenanceCharges"
              name="maintenanceCharges"
              value={formData.maintenanceCharges}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Available From */}
        <div>
          <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700">
            Available From
          </label>
          <input
            type="date"
            id="availableFrom"
            name="availableFrom"
            value={formData.availableFrom}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              placeholder="Add amenity"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddAmenity}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.amenities?.map((amenity, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {amenity}
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos (URLs)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={photoInput}
              onChange={(e) => setPhotoInput(e.target.value)}
              placeholder="Add photo URL"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {formData.photos?.map((photo, index) => (
              <div key={index} className="relative group">
                <img src={photo} alt={`Unit ${index + 1}`} className="w-full h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/units')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Unit'}
          </button>
        </div>
      </form>
    </div>
  );
};
