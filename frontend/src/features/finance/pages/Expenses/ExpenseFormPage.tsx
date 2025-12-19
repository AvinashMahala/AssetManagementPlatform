import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import navigateBackOrFallback from '../../../../utils/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Label } from '@/componentDesignLibrary';
import { Textarea } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Checkbox } from '@/componentDesignLibrary';
import { AppLayout } from '../../../../components/layout';
import { useProperties, useUnits, useCreateExpense, useUpdateExpense, useExpense } from '../../../../hooks';
import { useAuthContext } from '../../../../contexts';
import { useNotifications } from '../../../../contexts';
import type { Property } from '../../../../types/property';
import type { Unit } from '../../../../types/unit';
import type { ExpenseInput, ExpenseUpdateInput, ExpenseTypeValue, ExpenseFrequencyValue, ExpenseDistributionValue } from '../../../../types/expense';

const ExpenseFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { user } = useAuthContext();
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<ExpenseInput>({
    propertyId: '',
    unitId: '',
    type: 'other' as ExpenseTypeValue,
    description: '',
    amount: 0,
    frequency: 'one_time' as ExpenseFrequencyValue,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    distribution: 'owner_only' as ExpenseDistributionValue,
    affectedUnitIds: [],
    billPhotoUrl: '',
    status: 'active',
    createdBy: String(user?.id || ''),
    updatedBy: String(user?.id || '')
  });

  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { properties } = useProperties();
  const { units } = useUnits();
  const { data: expense, loading: expenseLoading } = useExpense(id || '');
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  // Load expense data for editing
  useEffect(() => {
    if (isEditing && expense) {
      setFormData({
        propertyId: expense.propertyId,
        unitId: expense.unitId || 'property-wide',
        type: expense.type,
        description: expense.description,
        amount: expense.amount,
        frequency: expense.frequency,
        startDate: new Date(expense.startDate).toISOString().split('T')[0],
        endDate: expense.endDate ? new Date(expense.endDate).toISOString().split('T')[0] : '',
        distribution: expense.distribution,
        affectedUnitIds: expense.affectedUnitIds || [],
        billPhotoUrl: expense.billPhotoUrl || '',
        status: expense.status,
        createdBy: expense.createdBy,
        updatedBy: String(user?.id || '')
      });
      setSelectedUnits(expense.affectedUnitIds || []);
    }
  }, [expense, isEditing, user?.id]);

  // Filter units based on selected property
  const propertyUnits = units.filter((unit: Unit) => unit.propertyId === formData.propertyId);

  const handleInputChange = (field: keyof ExpenseInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUnitToggle = (unitId: string, checked: boolean) => {
    const newSelectedUnits = checked
      ? [...selectedUnits, unitId]
      : selectedUnits.filter(id => id !== unitId);

    setSelectedUnits(newSelectedUnits);
    setFormData(prev => ({
      ...prev,
      affectedUnitIds: newSelectedUnits
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        amount: Number(formData.amount),
        affectedUnitIds: formData.distribution === 'specific_units' ? selectedUnits : []
      };

      if (isEditing) {
        const updateData: ExpenseUpdateInput = {
          ...submitData,
          updatedBy: String(user?.id || '')
        };
        await updateExpense.mutate({ id, data: updateData });
      } else {
        await createExpense.mutate(submitData);
      }

      showSuccess(`Expense ${isEditing ? 'updated' : 'created'} successfully!`);
      navigateBackOrFallback(navigate, '/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
      showError(`Failed to ${isEditing ? 'update' : 'create'} expense. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const expenseTypes: { value: ExpenseTypeValue; label: string }[] = [
    { value: 'wifi_internet', label: 'WiFi/Internet' },
    { value: 'food_meals', label: 'Food/Meals' },
    { value: 'inverter_generator', label: 'Inverter/Generator' },
    { value: 'cable_dish', label: 'Cable/Dish' },
    { value: 'surveillance_cameras', label: 'Surveillance Cameras' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'water_bill', label: 'Water Bill' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'water_heater', label: 'Water Heater' },
    { value: 'ac_repair', label: 'AC Repair' },
    { value: 'furniture_repair', label: 'Furniture Repair' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'painting', label: 'Painting' },
    { value: 'electrical_work', label: 'Electrical Work' },
    { value: 'other', label: 'Other' }
  ];

  const frequencyOptions: { value: ExpenseFrequencyValue; label: string }[] = [
    { value: 'one_time', label: 'One-time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const distributionOptions: { value: ExpenseDistributionValue; label: string }[] = [
    { value: 'owner_only', label: 'Owner Only' },
    { value: 'split_among_tenants', label: 'Split Among Tenants' },
    { value: 'specific_units', label: 'Specific Units' }
  ];

  if (isEditing && expenseLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading expense...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigateBackOrFallback(navigate, '/expenses')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Expenses
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Expense' : 'Add New Expense'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditing ? 'Update expense details' : 'Create a new expense record'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyId">Property *</Label>
                  <Select
                    value={formData.propertyId}
                    onValueChange={(value) => {
                      handleInputChange('propertyId', value);
                      handleInputChange('unitId', 'property-wide'); // Reset unit when property changes
                      setSelectedUnits([]); // Reset selected units
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property: Property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Selection (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="unitId">Unit (Optional)</Label>
                  <Select
                    value={formData.unitId}
                    onValueChange={(value) => handleInputChange('unitId', value === 'property-wide' ? '' : value)}
                    disabled={!formData.propertyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property-wide">Property-wide expense</SelectItem>
                      {propertyUnits.map((unit: Unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unitName || `Unit ${unit.unitNumber}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Leave empty for property-wide expenses
                  </p>
                </div>
              </div>

              {/* Expense Type and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Expense Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ExpenseTypeValue) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the expense..."
                  rows={3}
                  required
                />
              </div>

              {/* Frequency and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value: ExpenseFrequencyValue) => handleInputChange('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    For recurring expenses
                  </p>
                </div>
              </div>

              {/* Distribution */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="distribution">Distribution Method *</Label>
                  <Select
                    value={formData.distribution}
                    onValueChange={(value: ExpenseDistributionValue) => handleInputChange('distribution', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select distribution method" />
                    </SelectTrigger>
                    <SelectContent>
                      {distributionOptions.map((dist) => (
                        <SelectItem key={dist.value} value={dist.value}>
                          {dist.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Specific Units Selection */}
                {formData.distribution === 'specific_units' && formData.propertyId && (
                  <div className="space-y-2">
                    <Label>Select Affected Units</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {propertyUnits.map((unit: Unit) => (
                        <div key={unit.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`unit-${unit.id}`}
                            checked={selectedUnits.includes(unit.id)}
                            onCheckedChange={(checked) => handleUnitToggle(unit.id, checked as boolean)}
                          />
                          <Label htmlFor={`unit-${unit.id}`} className="text-sm">
                            {unit.unitName || `Unit ${unit.unitNumber}`}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {propertyUnits.length === 0 && (
                      <p className="text-sm text-gray-500">No units available for this property</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bill Photo URL */}
              <div className="space-y-2">
                <Label htmlFor="billPhotoUrl">Bill Photo URL (Optional)</Label>
                <Input
                  id="billPhotoUrl"
                  type="url"
                  value={formData.billPhotoUrl}
                  onChange={(e) => handleInputChange('billPhotoUrl', e.target.value)}
                  placeholder="https://example.com/bill-photo.jpg"
                />
                <p className="text-sm text-gray-500">
                  Upload bill photo to file storage and paste the URL here
                </p>
              </div>

              {/* Status */}
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigateBackOrFallback(navigate, '/expenses')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : (isEditing ? 'Update Expense' : 'Create Expense')}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default ExpenseFormPage;