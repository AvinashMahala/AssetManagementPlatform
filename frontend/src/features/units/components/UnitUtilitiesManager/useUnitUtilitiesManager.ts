import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtilityType, UtilityBillingMethod } from '@/features/units/types';
import type { UnitUtility } from '@/features/units/types';
import { useUnitUtilities, useUpdateUnitUtility, useDeleteUnitUtility, useToggleUnitUtility, useLastMeterReadings } from '@/hooks';

export const useUnitUtilitiesManager = (unitId: string, propertyId: string) => {
  const navigate = useNavigate();
  const { utilities, loading, error, refetch } = useUnitUtilities(unitId);
  const { loading: readingsLoading, data: availableMeters } = useLastMeterReadings(unitId);
  const { mutate: updateUtility, loading: updating } = useUpdateUnitUtility();
  const { mutate: deleteUtility, loading: deleting } = useDeleteUnitUtility();
  const { mutate: toggleUtility, loading: toggling } = useToggleUnitUtility();

  const METERED_UTILITY_TYPES = [UtilityType.ELECTRICITY, UtilityType.WATER, UtilityType.GAS];

  const [showForm, setShowForm] = useState(false);
  const [editingUtility, setEditingUtility] = useState<UnitUtility | null>(null);
  const [formData, setFormData] = useState<Partial<UnitUtility>>({
    utilityType: UtilityType.ELECTRICITY,
    utilityName: '',
    billingMethod: UtilityBillingMethod.FIXED,
    isEnabled: true,
  });

  useEffect(() => {
    const isMeteredType = METERED_UTILITY_TYPES.includes(formData.utilityType as any);
    const newBillingMethod = isMeteredType ? UtilityBillingMethod.METER_BASED : UtilityBillingMethod.FIXED;
    
    setFormData(prev => ({
      ...prev,
      billingMethod: newBillingMethod,
      // Clear meter-related fields for non-metered utilities
      ...(newBillingMethod === UtilityBillingMethod.FIXED && {
        meterId: undefined,
        multiplier: undefined
      })
    }));

    // Auto-resolve meter ID for metered utilities
    if (isMeteredType && availableMeters && formData.utilityType) {
      const matchingMeter = availableMeters.find(meter => 
        meter.meterType.toLowerCase() === formData.utilityType?.toLowerCase()
      );
      
      if (matchingMeter && (!formData.meterId || editingUtility)) {
        setFormData(prev => ({
          ...prev,
          meterId: matchingMeter.meterId,
          multiplier: prev.multiplier || 1.0 // Default multiplier
        }));
      }
    }
  }, [formData.utilityType, availableMeters, editingUtility]);

  const resetForm = () => {
    setFormData({
      utilityType: UtilityType.ELECTRICITY,
      utilityName: '',
      billingMethod: UtilityBillingMethod.METER_BASED, // Default for electricity
      isEnabled: true,
    });
    setEditingUtility(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    // Navigate to meter creation page with pre-filled unit and property IDs
    navigate(`/meters/create?propertyId=${propertyId}&unitId=${unitId}`);
  };

  const handleEdit = (utility: UnitUtility) => {
    setEditingUtility(utility);
    setFormData({ ...utility });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        unitId,
        propertyId,
      } as any;

      // Only handle editing since creation is now done via navigation
      if (editingUtility) {
        await updateUtility({ id: editingUtility.id, data });
      }

      resetForm();
      refetch();
    } catch (err) {
      console.error('Failed to update utility:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this utility?')) {
      try {
        await deleteUtility(id);
        refetch();
      } catch (err) {
        console.error('Failed to delete utility:', err);
      }
    }
  };

  const handleToggle = async (id: string, isEnabled: boolean) => {
    try {
      await toggleUtility({ id, isEnabled });
      refetch();
    } catch (err) {
      console.error('Failed to toggle utility:', err);
    }
  };

  return {
    utilities,
    loading: loading || readingsLoading,
    error,
    updating,
    deleting,
    toggling,
    showForm,
    setShowForm,
    editingUtility,
    formData,
    setFormData,
    availableMeters,
    METERED_UTILITY_TYPES,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleDelete,
    handleToggle,
    resetForm
  };
};
