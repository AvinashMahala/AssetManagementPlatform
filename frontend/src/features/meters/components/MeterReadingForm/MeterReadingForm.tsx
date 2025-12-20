import React from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Label } from '@/componentDesignLibrary';
import type { MeterReadingInput } from '@/features/meters/types';

interface MeterReadingFormProps {
  formData: Partial<MeterReadingInput>;
  errors: Record<string, string>;
  latestReading: any; // Replace with MeterReading type
  onInputChange: (field: keyof MeterReadingInput, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
}

export const MeterReadingForm: React.FC<MeterReadingFormProps> = ({
  formData,
  errors,
  latestReading,
  onInputChange,
  onSubmit,
  onCancel,
  loading,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
              onChange={(e) => onInputChange('readingDate', e.target.value)}
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
                onChange={(e) => onInputChange('currentReading', parseFloat(e.target.value) || 0)}
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
              onChange={(e) => onInputChange('meterPhotoUrl', e.target.value)}
              placeholder="https://example.com/meter-photo.jpg"
            />
            <p className="text-xs text-gray-500">Upload a photo of the meter for reference</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
  );
};
