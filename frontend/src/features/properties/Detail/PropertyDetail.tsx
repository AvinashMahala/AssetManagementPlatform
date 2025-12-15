import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '../../../utils/navigation';
import { ArrowLeft, Edit, Building2, MapPin, Home, Calendar, FileImage, Receipt, FileText } from 'lucide-react';
import { useProperty } from '../../../hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { FileUpload, PropertyFileGallery } from '../../../components/files';
import { formatDate } from '../../../utils';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, loading, error, displayError } = useProperty(id!);

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
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigateBackOrFallback(navigate, '/properties')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/properties/${id}/rent-collection`)}>
            <Receipt className="mr-2 h-4 w-4" />
            Rent Collection
          </Button>
          <Button variant="outline" onClick={() => navigate(`/properties/${id}/template-customization`)}>
            <FileImage className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button onClick={() => navigate(`/properties/${id}/edit`)}><Edit className="mr-2 h-4 w-4" /> Edit Property</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{property.name}</CardTitle>
              <p className="text-muted-foreground">{property.description}</p>
            </div>
            <Badge variant={property.status === 'available' ? 'success' : 'secondary'}>{property.status.replace('_', ' ')}</Badge>
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
            <div><p className="text-sm text-muted-foreground">Type</p><p className="font-medium capitalize">{property.propertyType.replace('_', ' ')}</p></div>
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

      {/* File Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Property Files & Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery">File Gallery</TabsTrigger>
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="mt-6">
              <PropertyFileGallery
                propertyId={property.id}
                onFileDeleted={(fileId: string) => {
                  console.log('File deleted:', fileId);
                }}
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
              <FileUpload
                entityType="property"
                entityId={property.id}
                onUploadSuccess={(file) => {
                  console.log('File uploaded:', file);
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Timeline</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div><p className="text-sm text-muted-foreground">Created</p><p className="font-medium">{formatDate(property.createdAt)}</p></div>
          <div><p className="text-sm text-muted-foreground">Last Updated</p><p className="font-medium">{formatDate(property.updatedAt)}</p></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetail;