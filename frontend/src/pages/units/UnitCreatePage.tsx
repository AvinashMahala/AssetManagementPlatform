import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import UnitFormModern from '../../components/forms/UnitFormModern';

export const UnitCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    // This is handled by the UnitFormModern component internally
    console.log('Unit created:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/units')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Units
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Unit</h1>
          <p className="mt-2 text-gray-600">Add a new unit to your property portfolio</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Unit Information
            </CardTitle>
            <CardDescription>
              Enter the details for the new unit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UnitFormModern onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
