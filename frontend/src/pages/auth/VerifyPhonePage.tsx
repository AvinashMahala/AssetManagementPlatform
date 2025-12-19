import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VerifyPhoneForm } from '../../components/forms';
import { Card } from '../../components/ui/card';

export const VerifyPhonePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to profile page after successful verification
    navigate('/profile');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-8">
          <VerifyPhoneForm
            onSuccess={handleSuccess}
          />
        </Card>
      </div>
    </div>
  );
};