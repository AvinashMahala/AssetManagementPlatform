import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '../../../utils/navigation';
import { Edit, Building2, MapPin, Home, FileImage, Receipt, FileText } from 'lucide-react';
import { useProperty } from '../../../hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { FileUpload, PropertyFileGallery } from '../../../components/files';
import { PageHeader } from '../../../componentDesignLibrary/components/PageHeader';
import { StatusBadge } from '../../../componentDesignLibrary/components/status-badge/StatusBadge';
import type { StatusType } from '../../../componentDesignLibrary/components/status-badge/StatusBadge';
import { PropertyStatus } from '../../../types/property';
import { getTypeLabel } from '../utils/propertyUtils';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, loading, error, displayError } = useProperty(id!);

  const mapStatusToBadgeStatus = (status: string): StatusType => {
    switch (status) {
      case PropertyStatus.AVAILABLE: return 'available';
      case PropertyStatus.OCCUPIED: return 'occupied';
      case PropertyStatus.UNDER_MAINTENANCE: return 'maintenance';
      case PropertyStatus.VACANT: return 'inactive';
      default: return 'inactive';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <Card><div className="animate-pulse p-8 space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">{[...Array(12)].map((_, i) => <div key={i} className="h-4 bg-muted rounded"></div>)}</div>
        </div></Card>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">{displayError || 'Property not found'}</p>
          <Button onClick={() => navigateBackOrFallback(navigate, '/properties')}>Back to Properties</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl space-y-6">
      <PageHeader
        title={property.name}
        subtitle="Details"
        backLabel="Back"
        onBack={() => navigateBackOrFallback(navigate, '/properties')}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`/properties/${id}/rent-collection`)}>
              <Receipt className="mr-2 h-4 w-4" />
              Rent Collection
            </Button>
            <Button variant="outline" onClick={() => navigate(`/properties/${id}/template-customization`)}>
              <FileImage className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button onClick={() => navigate(`/properties/${id}/edit`)}><Edit className="mr-2 h-4 w-4" /> Edit Property</Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground">{property.description}</p>
            </div>
            <StatusBadge
              status={mapStatusToBadgeStatus(property.status)}
              customLabel={property.status.replace('_', ' ')}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Address</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><p className="text-sm text-muted-foreground">Street</p><p className="font-medium">{property.address.street}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-sm text-muted-foreground">City</p><p className="font-medium">{property.address.city}</p></div>
              <div><p className="text-sm text-muted-foreground">State</p><p className="font-medium">{property.address.state}</p></div>
            </div>
            <div><p className="text-sm text-muted-foreground">Pincode</p><p className="font-medium">{property.address.pincode}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Property Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><p className="text-sm text-muted-foreground">Type</p><p className="font-medium capitalize">{getTypeLabel(property.propertyType)}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-sm text-muted-foreground">Total Area</p><p className="font-medium">{property.totalArea.toLocaleString()} sq ft</p></div>
              {property.totalFloors && <div><p className="text-sm text-muted-foreground">Floors</p><p className="font-medium">{property.totalFloors}</p></div>}
            </div>
            {property.yearBuilt && <div><p className="text-sm text-muted-foreground">Year Built</p><p className="font-medium">{property.yearBuilt}</p></div>}
            {property.parkingSpaces && <div><p className="text-sm text-muted-foreground">Parking Spaces</p><p className="font-medium">{property.parkingSpaces}</p></div>}
          </CardContent>
        </Card>
      </div>

      {property.buildingAmenities && property.buildingAmenities.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" /> Amenities</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{property.buildingAmenities.map((amenity: string, i: number) => <Badge key={i} variant="outline">{amenity}</Badge>)}</div></CardContent>
        </Card>
      )}

      <Tabs defaultValue="files" className="w-full">
        <TabsList>
          <TabsTrigger value="files" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Files & Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="mt-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle>Upload Documents</CardTitle></CardHeader>
              <CardContent>
                <FileUpload
                  entityId={property.id}
                  entityType="property"
                  onUploadComplete={() => {
                    // Refresh property data or file list
                  }}
                />
              </CardContent>
            </Card>
            <PropertyFileGallery propertyId={property.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyDetail;
