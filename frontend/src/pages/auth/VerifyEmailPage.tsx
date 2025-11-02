import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { VerifyEmailForm } from '../../components/forms';
import { Card } from '../../components/common/Card';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email') || '';

  const handleSuccess = () => {
    // Redirect to login page after successful verification
    navigate('/login?verified=email');
  };

  const handleResend = () => {
    // Handle resend logic if needed
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-8">
          <VerifyEmailForm
            email={email}
            onSuccess={handleSuccess}
            onResend={handleResend}
          />
        </Card>
      </div>
    </div>
  );
};