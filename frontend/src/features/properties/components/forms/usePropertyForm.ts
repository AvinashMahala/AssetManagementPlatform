import React from 'react';
import type { ApiError } from '@/types';
import type { PropertyInput } from '@/features/properties/types';
import { buildInitialState } from './initialState';
import { getTabForField, validateTab, validateAll, hasTabData } from './validators';
import type { FormErrors, TabId } from './types';
import { TABS as TABS_CONST } from './constants';

interface UsePropertyFormOptions {
  initialData?: Partial<PropertyInput>;
  isEdit?: boolean;
  currentUserId?: string | undefined;
  onSubmit: (data: PropertyInput) => Promise<void>;
  apiError?: ApiError | null;
  owner?: any;
  ownerLoading?: boolean;
}

export const usePropertyForm = ({ initialData, isEdit = false, currentUserId, onSubmit, apiError, owner, ownerLoading }: UsePropertyFormOptions) => {
  const [activeTab, setActiveTab] = React.useState<TabId>(TABS_CONST[0].id);
  const [completedTabs, setCompletedTabs] = React.useState<Set<string>>(new Set());
  const [formData, setFormData] = React.useState<PropertyInput>(() => buildInitialState(initialData, isEdit, currentUserId));
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update owner details when owner data is loaded
  React.useEffect(() => {
    if (owner && !ownerLoading) {
      setFormData(prev => ({
        ...prev,
        ownerDetails: {
          ...prev.ownerDetails,
          name: owner.name || owner.username || prev.ownerDetails.name || ''
        }
      }));
    }
  }, [owner, ownerLoading]);

  // Map API error into form errors and focus the field
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (apiError) {
      if (apiError.details) {
        const fieldErrors: FormErrors = {};
        Object.entries(apiError.details).forEach(([field, message]) => {
          if (field.startsWith('address.')) {
            const addressField = field.split('.')[1];
            fieldErrors[addressField] = message as string;
            return;
          }

          if (field.startsWith('ownerDetails.')) {
            if (field.includes('name')) {
              fieldErrors['ownerName'] = message as string;
            } else if (field.includes('mobileNumbers')) {
              fieldErrors['ownerMobile'] = message as string;
            } else if (field.includes('emailIds')) {
              fieldErrors['ownerEmail'] = message as string;
            } else {
              fieldErrors[field] = message as string;
            }
            return;
          }

          fieldErrors[field] = message as string;
        });

        setErrors(fieldErrors);

        const firstInvalidField = Object.keys(fieldErrors)[0];
        if (firstInvalidField) {
          const targetTab = getTabForField(firstInvalidField);
          if (targetTab) setActiveTab(targetTab);
          timer = setTimeout(() => {
            const element = document.getElementById(firstInvalidField) || document.querySelector(`[name="${firstInvalidField}"]`) as HTMLElement;
            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      } else {
        setErrors(prev => ({ ...prev, submit: apiError.message }));
      }
    }

    return () => { if (timer) clearTimeout(timer); };
  }, [apiError]);

  const handleChange = <K extends keyof PropertyInput>(field: K, value: PropertyInput[K]) => {
    setFormData(prev => ({ ...prev, [field]: value } as unknown as PropertyInput));
    const fieldKey = field as string;
    if (errors[fieldKey]) setErrors(prev => ({ ...prev, [fieldKey]: '' }));
  };

  const handleAddressChange = (field: keyof PropertyInput['address'], value: string) => {
    setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      buildingAmenities: prev.buildingAmenities?.includes(amenity)
        ? prev.buildingAmenities.filter(a => a !== amenity)
        : [...(prev.buildingAmenities || []), amenity]
    }));
  };

  const validateTabLocal = (tabId: string): boolean => {
    const newErrors = validateTab(tabId as any, formData, !!isEdit);
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateLocal = (): FormErrors => {
    const newErrors = validateAll(formData, !!isEdit);
    setErrors(newErrors);
    return newErrors;
  };

  const handleTabChange = (tabId: string) => {
    const id = tabId as TabId;
    if (isEdit) {
      setActiveTab(id);
    } else {
      if (validateTabLocal(activeTab)) {
        setCompletedTabs(prev => new Set([...prev, activeTab]));
        setActiveTab(id);
      }
    }
  };

  const handleNext = () => {
    if (validateTabLocal(activeTab)) {
      setCompletedTabs(prev => new Set([...prev, activeTab]));
      const currentIndex = TABS_CONST.findIndex((tab) => tab.id === activeTab);
      if (currentIndex < TABS_CONST.length - 1) setActiveTab(TABS_CONST[currentIndex + 1].id as TabId);
    }
  };

  const handlePrevious = () => {
    const currentIndex = TABS_CONST.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) setActiveTab(TABS_CONST[currentIndex - 1].id as TabId);
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof (e as any).preventDefault === 'function') (e as any).preventDefault();
    setErrors(prev => ({ ...prev, submit: '' }));

    const newErrors = validateLocal();
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField) {
        const targetTab = getTabForField(firstErrorField);
        if (targetTab) setActiveTab(targetTab);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setErrors(prev => ({ ...prev, submit: err?.message || 'Submit failed' }));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasTabDataLocal = (tabId: string) => hasTabData(tabId as any, formData);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    activeTab,
    setActiveTab,
    completedTabs,
    handleChange,
    handleAddressChange,
    toggleAmenity,
    validateTabLocal,
    validateLocal,
    handleTabChange,
    handleNext,
    handlePrevious,
    handleSubmit,
    hasTabData: hasTabDataLocal
  };
};

export default usePropertyForm;
