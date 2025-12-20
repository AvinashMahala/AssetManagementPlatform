import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import { ArrowLeft, Edit, Calendar, DollarSign, Building, MapPin, Users, FileImage, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { AppLayout } from '@/components/layout';
import { useExpense, useProperties, useUnits } from '@/hooks';
import type { Property } from '@/features/properties/types';
import type { Unit } from '@/features/units/types';
import { getErrorMessage } from '@/types/api';

const ExpenseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: expense, loading, error } = useExpense(id || '');
  const { properties } = useProperties();
  const { units } = useUnits();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading expense details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !expense) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600">
              <p className="text-lg font-semibold">Error loading expense</p>
              <p className="mt-2">{getErrorMessage(error) || 'Expense not found'}</p>
            </div>
            <Button
              onClick={() => navigateBackOrFallback(navigate, '/expenses')}
              className="mt-4"
            >
              Back to Expenses
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const property = properties.find((p: Property) => p.id === expense.propertyId);
  const unit = units.find((u: Unit) => u.id === expense.unitId);
  const affectedUnits = units.filter((u: Unit) => expense.affectedUnitIds?.includes(u.id));

  const getExpenseTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      wifi_internet: 'WiFi/Internet',
      food_meals: 'Food/Meals',
      inverter_generator: 'Inverter/Generator',
      cable_dish: 'Cable/Dish',
      surveillance_cameras: 'Surveillance Cameras',
      laundry: 'Laundry',
      water_bill: 'Water Bill',
      plumbing: 'Plumbing',
      water_heater: 'Water Heater',
      ac_repair: 'AC Repair',
      furniture_repair: 'Furniture Repair',
      cleaning: 'Cleaning',
      housekeeping: 'Housekeeping',
      painting: 'Painting',
      electrical_work: 'Electrical Work',
      other: 'Other'
    };
    return typeMap[type] || type;
  };

  const getFrequencyLabel = (frequency: string) => {
    const freqMap: Record<string, string> = {
      one_time: 'One-time',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return freqMap[frequency] || frequency;
  };

  const getDistributionLabel = (distribution: string) => {
    const distMap: Record<string, string> = {
      owner_only: 'Owner Only',
      split_among_tenants: 'Split Among Tenants',
      specific_units: 'Specific Units'
    };
    return distMap[distribution] || distribution;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
                Expense Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {getExpenseTypeLabel(expense.type)} - ₹{expense.amount.toLocaleString()}
              </p>
            </div>
          </div>
            <Button
              onClick={() => navigate(`/expenses/${expense.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Expense
          </Button>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge variant={getStatusBadgeVariant(expense.status)} className="text-sm px-3 py-1">
            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
          </Badge>
        </div>

        {/* Main Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-sm">{getExpenseTypeLabel(expense.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-lg font-semibold text-green-600">₹{expense.amount.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-sm mt-1">{expense.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Frequency</p>
                  <p className="text-sm">{getFrequencyLabel(expense.frequency)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Distribution</p>
                  <p className="text-sm">{getDistributionLabel(expense.distribution)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property & Unit Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property & Unit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Property</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-sm">{property?.name || 'Unknown Property'}</p>
                </div>
              </div>

              {unit && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Unit</p>
                  <p className="text-sm mt-1">{unit.unitName || `Unit ${unit.unitNumber}`}</p>
                </div>
              )}

              {expense.affectedUnitIds && expense.affectedUnitIds.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Affected Units</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {affectedUnits.map((affectedUnit) => (
                        <Badge key={affectedUnit.id} variant="outline" className="text-xs">
                          {affectedUnit.unitName || `Unit ${affectedUnit.unitNumber}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="text-sm mt-1">
                  {new Date(expense.startDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {expense.endDate && (
                <div>
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="text-sm mt-1">
                    {new Date(expense.endDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bill Photo */}
        {expense.billPhotoUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Bill Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img
                  src={expense.billPhotoUrl}
                  alt="Bill photo"
                  className="max-w-full h-auto max-h-96 rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Audit Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-sm mt-1">
                  {new Date(expense.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-sm mt-1">
                  {new Date(expense.updatedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ExpenseDetailPage;