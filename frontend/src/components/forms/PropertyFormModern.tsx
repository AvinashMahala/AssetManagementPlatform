import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import type { PropertyInput } from '../../types/property';
import { PropertyType, PropertyStatus } from '../../types/property';

interface PropertyFormModernProps {
  initialData?: Partial<PropertyInput>;
  onSubmit: (data: PropertyInput) => Promise<void>;
  loading?: boolean;
  title?: string;
}

const AMENITIES = ['Parking', 'Lift', 'Security', 'Gym', 'Power Backup', 'Water Supply', 'Garden', 'Swimming Pool'];

const PropertyFormModern: React.FC<PropertyFormModernProps> = ({ initialData, onSubmit, loading, title = 'Create Property' }) => {
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
    <div className="container mx-auto py-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/properties')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>Enter property details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <select id="propertyType" value={formData.propertyType} onChange={(e) => handleChange('propertyType', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {Object.values(PropertyType).map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select id="status" value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {Object.values(PropertyStatus).map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerId">Owner ID *</Label>
                <Input id="ownerId" value={formData.ownerId} onChange={(e) => handleChange('ownerId', e.target.value)} />
                {errors.ownerId && <p className="text-sm text-destructive">{errors.ownerId}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input id="street" value={formData.address.street} onChange={(e) => handleAddressChange('street', e.target.value)} />
              {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={formData.address.city} onChange={(e) => handleAddressChange('city', e.target.value)} />
                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input id="state" value={formData.address.state} onChange={(e) => handleAddressChange('state', e.target.value)} />
                {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input id="pincode" value={formData.address.pincode} onChange={(e) => handleAddressChange('pincode', e.target.value)} />
                {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input id="landmark" value={formData.address.landmark} onChange={(e) => handleAddressChange('landmark', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="totalArea">Total Area (sq ft) *</Label>
                <Input id="totalArea" type="number" value={formData.totalArea} onChange={(e) => handleChange('totalArea', Number(e.target.value))} />
                {errors.totalArea && <p className="text-sm text-destructive">{errors.totalArea}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalFloors">Total Floors</Label>
                <Input id="totalFloors" type="number" value={formData.totalFloors || ''} onChange={(e) => handleChange('totalFloors', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input id="yearBuilt" type="number" value={formData.yearBuilt || ''} onChange={(e) => handleChange('yearBuilt', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                <Input id="parkingSpaces" type="number" value={formData.parkingSpaces || ''} onChange={(e) => handleChange('parkingSpaces', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(amenity => (
                  <Badge key={amenity} variant={formData.buildingAmenities?.includes(amenity) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleAmenity(amenity)}>
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/properties')}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Property'}</Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyFormModern;
