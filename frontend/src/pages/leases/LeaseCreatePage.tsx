import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import LeaseFormModern from '../../components/forms/LeaseFormModern';

export const LeaseCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/leases')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leases
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Lease</h1>
          <p className="mt-2 text-gray-600">Create a new lease agreement for a tenant</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lease Agreement
            </CardTitle>
            <CardDescription>
              Enter the lease details and terms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeaseFormModern />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
