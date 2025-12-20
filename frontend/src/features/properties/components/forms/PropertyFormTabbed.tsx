import React from 'react';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import {
  Building2,
  MapPin,
  Home,
  User,
  Star,
  Upload,
  FileText,
  // CheckCircle moved to StatusCurrencyPanel
} from 'lucide-react';
import {
  FormGrid,
  GenericTabbedForm
} from '@/componentDesignLibrary';
import StatusCurrencyPanel from './components/StatusCurrencyPanel';
import { Tabs, TabsContent } from '@/componentDesignLibrary';
// PropertyStatus and currency options are used inside StatusCurrencyPanel
import { useUser, useUsers } from '@/hooks';
import { useAuth } from '@/hooks';
import DetailsTab from './tabs/DetailsTab';
import OwnerTab from './tabs/OwnerTab';
import AmenitiesTab from './tabs/AmenitiesTab';
import FilesTab from './tabs/FilesTab';
import ReceiptTab from './tabs/ReceiptTab';
import BasicTab from './tabs/BasicTab';
import AddressTab from './tabs/AddressTab';
import { TABS as TABS_CONST } from './constants';
import type { PropertyFormTabbedProps } from './types';
import usePropertyForm from './usePropertyForm';

// `TABS` and `AMENITIES` come from ./constants; icons are attached below before passing to the GenericTabbedForm

const PropertyFormTabbed: React.FC<PropertyFormTabbedProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false,
  propertyName,
  propertyId,
  apiError
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: owner, loading: ownerLoading } = useUser(
    initialData?.ownerId && initialData.ownerId.trim()
      ? initialData.ownerId
      : (!isEdit ? currentUser?.id || '' : null)
  );
  const { data: users, loading: usersLoading } = useUsers();

  // Debug effect removed — avoid no-op effects in production

  const {
    formData,
    errors,
    isSubmitting,
    activeTab,
    completedTabs,
    handleChange,
    handleAddressChange,
    toggleAmenity,
    handleTabChange,
    handleNext,
    handlePrevious,
    handleSubmit,
    hasTabData
  } = usePropertyForm({ initialData, isEdit, currentUserId: currentUser?.id, onSubmit, apiError, owner, ownerLoading });

  // All form state and behavior moved into usePropertyForm

  const handleCancel = () => {
    if (isEdit && propertyId) {
      // In edit mode, go back to property detail/dashboard
      navigateBackOrFallback(navigate, `/properties/${propertyId}/dashboard`);
    } else {
      navigateBackOrFallback(navigate, '/properties');
    }
  };



  // hasTabData is provided by the hook
  return (
      <GenericTabbedForm
      title={isEdit ? `Edit ${propertyName || 'Property'}` : "Create Property"}
      subtitle={isEdit ? "Update property information" : "Fill in the details to create a new property"}
      tabs={TABS_CONST.map(tab => ({
        ...tab,
        icon: tab.id === 'basic' ? Building2 : tab.id === 'address' ? MapPin : tab.id === 'details' ? Home : tab.id === 'owner' ? User : tab.id === 'amenities' ? Star : tab.id === 'files' ? Upload : FileText
      }))}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      completedTabs={completedTabs}
      isEdit={isEdit}
      loading={loading || isSubmitting}
      hasTabData={isEdit ? hasTabData : undefined}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel={isEdit ? "Save Changes" : "Create Property"}
    >
      {errors.submit && (
        <div role="alert" className="p-4 mb-4 rounded bg-red-50 text-red-700">
          {errors.submit}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsContent value="basic" className="p-6">
          <FormGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" gap="lg">
            <BasicTab formData={formData} errors={errors} users={users ?? undefined} usersLoading={usersLoading} onChange={(f, v) => handleChange(f as any, v)} />
              <StatusCurrencyPanel status={formData.status} currency={formData.currency} onChange={(field: string, value: any) => handleChange(field as any, value)} />
          </FormGrid>
        </TabsContent>

        <TabsContent value="address" className="p-6">
          <FormGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" gap="lg">
            <AddressTab formData={formData} errors={errors} onAddressChange={(f, v) => handleAddressChange(f as any, v)} />
          </FormGrid>
        </TabsContent>

        <TabsContent value="details" className="p-6">
          <FormGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" gap="lg">
            <DetailsTab formData={formData} errors={errors} onChange={(f, v) => handleChange(f as any, v)} toggleAmenity={toggleAmenity} />
          </FormGrid>
        </TabsContent>

        <TabsContent value="owner" className="p-6">
          <OwnerTab formData={formData} errors={errors} onOwnerChange={(value) => handleChange('ownerDetails', value)} isEdit={isEdit} />
        </TabsContent>

        <TabsContent value="amenities" className="p-6">
          <AmenitiesTab value={formData.amenities} onChange={(value) => handleChange('amenities', value)} />
        </TabsContent>

        <TabsContent value="files" className="p-6">
          <FilesTab files={formData.files} onFilesChange={(files) => handleChange('files', files)} />
        </TabsContent>

        <TabsContent value="receipt" className="p-6">
          <ReceiptTab value={formData.receiptTemplate as any} onChange={(value) => handleChange('receiptTemplate', value as any)} />
        </TabsContent>
      </Tabs>
    </GenericTabbedForm>
  );
};

export default PropertyFormTabbed;
