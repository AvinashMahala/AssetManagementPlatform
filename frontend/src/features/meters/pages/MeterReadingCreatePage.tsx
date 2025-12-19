import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMeter, useCreateMeterReading, useLatestMeterReading } from '../../../hooks';
import type { MeterReadingInput } from '../../../types/meter';
import { AppLayout } from '../../../components/layout/AppLayout';
import { MeterReadingForm, MeterReadingPreview, MeterLoading, MeterError, MeterPageHeader } from '../components';

export const MeterReadingCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: meter, loading: loadingMeter, error: meterError } = useMeter(id!);
  const { data: latestReading } = useLatestMeterReading(id!);
  const { mutate: createReading, loading } = useCreateMeterReading();

  const [formData, setFormData] = useState<Partial<MeterReadingInput>>({
    readingDate: new Date().toISOString().split('T')[0], // Today's date
    currentReading: 0,
    meterPhotoUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set previous reading when latest reading is loaded
  useEffect(() => {
    if (latestReading) {
      setFormData(prev => ({
        ...prev,
        previousReading: latestReading.currentReading,
      }));
    }
  }, [latestReading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.readingDate) {
      newErrors.readingDate = 'Reading date is required';
    }

    if (formData.currentReading === undefined || formData.currentReading < 0) {
      newErrors.currentReading = 'Current reading must be a positive number';
    }

    if (latestReading && formData.currentReading! <= latestReading.currentReading) {
      newErrors.currentReading = 'Current reading must be greater than the previous reading';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await createReading({
        meterId: id,
        data: formData as Omit<MeterReadingInput, 'meterId'>
      });
      navigate(`/meters/${id}`, {
        state: { message: 'Meter reading added successfully!' }
      });
    } catch (err) {
      console.error('Failed to create meter reading:', err);
      alert('Failed to add meter reading. Please try again.');
    }
  };

  const handleInputChange = (field: keyof MeterReadingInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const calculateUnitsConsumed = () => {
    if (formData.currentReading !== undefined && formData.previousReading !== undefined) {
      return Math.max(0, formData.currentReading - formData.previousReading);
    }
    return 0;
  };

  const calculateTotalCost = () => {
    if (!meter) return 0;

    const unitsConsumed = calculateUnitsConsumed();
    const consumptionCost = unitsConsumed * meter.costPerUnit;
    const fixedCharge = meter.fixedCharge || 0;
    return consumptionCost + fixedCharge;
  };

  if (loadingMeter) {
    return (
      <AppLayout title="Add Meter Reading">
        <MeterLoading message="Loading meter..." />
      </AppLayout>
    );
  }

  if (meterError || !meter) {
    return (
      <AppLayout title="Add Meter Reading">
        <MeterError 
          title="Meter Not Found" 
          message="The meter you're trying to add a reading for doesn't exist." 
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Add Reading - ${meter.meterName}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <MeterPageHeader 
          title="Add Meter Reading" 
          subtitle={`Record a new reading for ${meter.meterName}`}
          backPath={`/meters/${id}`}
        />

        <MeterReadingForm
          formData={formData}
          errors={errors}
          latestReading={latestReading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/meters/${id}`)}
          loading={loading}
        />

        <MeterReadingPreview
          unitsConsumed={calculateUnitsConsumed()}
          consumptionCost={calculateUnitsConsumed() * meter.costPerUnit}
          totalCost={calculateTotalCost()}
          costPerUnit={meter.costPerUnit}
          fixedCharge={meter.fixedCharge || 0}
        />
      </div>
    </AppLayout>
  );
};
