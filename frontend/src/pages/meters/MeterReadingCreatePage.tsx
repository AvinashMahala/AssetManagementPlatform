import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useMeter, useCreateMeterReading, useLatestMeterReading } from '../../hooks';
import type { MeterReadingInput } from '../../types/meter';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AppLayout } from '../../components/layout/AppLayout';

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loadingMeter) {
    return (
      <AppLayout title="Add Meter Reading">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meter...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (meterError || !meter) {
    return (
      <AppLayout title="Add Meter Reading">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Meter Not Found</h2>
            <p className="text-gray-600 mb-4">The meter you're trying to add a reading for doesn't exist.</p>
            <Button onClick={() => navigate('/meters')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meters
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Add Reading - ${meter.meterName}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/meters/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meter
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Meter Reading</h1>
            <p className="mt-2 text-gray-600">Record a new reading for {meter.meterName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reading Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="readingDate">Reading Date *</Label>
                <Input
                  id="readingDate"
                  type="date"
                  value={formData.readingDate}
                  onChange={(e) => handleInputChange('readingDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Can't be in the future
                />
                {errors.readingDate && <p className="text-sm text-red-600">{errors.readingDate}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="previousReading">Previous Reading</Label>
                  <Input
                    id="previousReading"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.previousReading || 0}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    {latestReading ? `From ${new Date(latestReading.readingDate).toLocaleDateString()}` : 'No previous reading'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentReading">Current Reading *</Label>
                  <Input
                    id="currentReading"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.currentReading}
                    onChange={(e) => handleInputChange('currentReading', parseFloat(e.target.value) || 0)}
                  />
                  {errors.currentReading && <p className="text-sm text-red-600">{errors.currentReading}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meterPhotoUrl">Meter Photo URL (Optional)</Label>
                <Input
                  id="meterPhotoUrl"
                  type="url"
                  value={formData.meterPhotoUrl}
                  onChange={(e) => handleInputChange('meterPhotoUrl', e.target.value)}
                  placeholder="https://example.com/meter-photo.jpg"
                />
                <p className="text-xs text-gray-500">Upload a photo of the meter for reference</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calculation Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{calculateUnitsConsumed().toFixed(2)}</div>
                  <div className="text-sm text-blue-600">Units Consumed</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(calculateUnitsConsumed() * meter.costPerUnit)}</div>
                  <div className="text-sm text-green-600">Consumption Cost</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(calculateTotalCost())}</div>
                  <div className="text-sm text-purple-600">Total Cost</div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Cost Breakdown:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Consumption: {calculateUnitsConsumed().toFixed(2)} units × {formatCurrency(meter.costPerUnit)} = {formatCurrency(calculateUnitsConsumed() * meter.costPerUnit)}</li>
                  {meter.fixedCharge && meter.fixedCharge > 0 && (
                    <li>Fixed Charge: {formatCurrency(meter.fixedCharge)}</li>
                  )}
                  <li><strong>Total: {formatCurrency(calculateTotalCost())}</strong></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/meters/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Adding Reading...' : 'Add Reading'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};