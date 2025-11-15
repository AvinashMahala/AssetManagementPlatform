import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUnit, useUpdateUnit, useProperties } from '../../hooks';
import { useNotifications } from '../../contexts';
import type { UnitInput } from '../../types/unit';
import { UnitStatus, UnitType } from '../../types/unit';
import { getErrorMessage } from '../../types/api';

export const UnitEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: unit, loading: loadingUnit, error: loadError } = useUnit(id!);
  const { mutate: updateUnit, loading: updating, error: updateError } = useUpdateUnit();
  const { properties } = useProperties();
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<UnitInput>({
    propertyId: '',
    unitNumber: '',
    floor: 0,
    unitType: UnitType.APARTMENT,
    status: UnitStatus.AVAILABLE,
    area: 0,
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    furnished: false,
    monthlyRent: 0,
    securityDeposit: 0,
    maintenanceCharges: 0,
    unitAmenities: [],
    unitPhotos: [],
    description: '',
  });

  const [amenityInput, setAmenityInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');

  useEffect(() => {
    if (unit) {
      setFormData({
        propertyId: unit.propertyId,
        unitNumber: unit.unitNumber,
        floor: unit.floor || 0,
        unitType: unit.unitType,
        status: unit.status,
        area: unit.area,
        bedrooms: unit.bedrooms || 2,
        bathrooms: unit.bathrooms || 2,
        balconies: unit.balconies || 1,
        furnished: unit.furnished,
        monthlyRent: unit.monthlyRent,
        securityDeposit: unit.securityDeposit,
        maintenanceCharges: unit.maintenanceCharges || 0,
        unitAmenities: unit.unitAmenities || [],
        unitPhotos: unit.unitPhotos || [],
        description: unit.description || '',
      });
    }
  }, [unit]);

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
        unitAmenities: [...(prev.unitAmenities || []), amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      unitAmenities: (prev.unitAmenities || []).filter((_: string, i: number) => i !== index)
    }));
  };

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        unitPhotos: [...(prev.unitPhotos || []), photoInput.trim()]
      }));
      setPhotoInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      unitPhotos: (prev.unitPhotos || []).filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUnit({ id: id!, data: formData });
      showSuccess('Unit updated successfully!');
      navigate(`/units/${id}`);
    } catch (err) {
      console.error('Failed to update unit:', err);
      showError('Failed to update unit. Please try again.');
    }
  };

  if (loadingUnit) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading unit details...</div>
      </div>
    );
  }

  if (loadError || !unit) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{getErrorMessage(loadError) || 'Unit not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Unit {unit.unitNumber}</h1>
        <p className="mt-2 text-gray-600">Update unit information</p>
      </div>

      {updateError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{getErrorMessage(updateError)}</p>
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
              <option value={UnitType.APARTMENT}>Apartment</option>
              <option value={UnitType.HOUSE}>House</option>
              <option value={UnitType.VILLA}>Villa</option>
              <option value={UnitType.STUDIO}>Studio</option>
              <option value={UnitType.ROOM}>Room</option>
              <option value={UnitType.COMMERCIAL}>Commercial</option>
              <option value={UnitType.OFFICE}>Office</option>
              <option value={UnitType.SHOP}>Shop</option>
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
              <option value={UnitStatus.VACANT}>Vacant</option>
            </select>
          </div>
        </div>

        {/* Area Details */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700">
              Area (sq ft) *
            </label>
            <input
              type="number"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
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

        {/* Furnished */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Furnished
          </label>
          <div className="mt-2">
            <input
              type="checkbox"
              id="furnished"
              name="furnished"
              checked={formData.furnished}
              onChange={(e) => setFormData(prev => ({ ...prev, furnished: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="furnished" className="ml-2 text-sm text-gray-700">
              This unit is furnished
            </label>
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700">
              Monthly Rent (₹) *
            </label>
            <input
              type="number"
              id="monthlyRent"
              name="monthlyRent"
              value={formData.monthlyRent}
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
            {formData.unitAmenities?.map((amenity: string, index: number) => (
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
            {formData.unitPhotos?.map((photo: string, index: number) => (
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
            onClick={() => navigate(`/units/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
