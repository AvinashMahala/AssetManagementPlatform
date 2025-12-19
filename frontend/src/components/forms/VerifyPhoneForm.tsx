import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '@/componentDesignLibrary';
import { FormField } from '@/componentDesignLibrary';
import { Form } from '@/componentDesignLibrary';
import { useAuthContext } from '../../contexts/AuthContext';

interface VerifyPhoneFormProps {
  onSuccess?: () => void;
}

export const VerifyPhoneForm: React.FC<VerifyPhoneFormProps> = ({
  onSuccess
}) => {
  const { verifyPhone, loading } = useAuthContext();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleVerify = async () => {
    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    try {
      const success = await verifyPhone(code);
      if (success) {
        setSuccess('Phone number verified successfully!');
        setError('');
        onSuccess?.();
      } else {
        setError('Invalid verification code');
      }
    } catch (_err) {
      setError('Verification failed. Please try again.');
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setError('');
    setSuccess('');

    if (!data.code) {
      setError('Please enter the verification code');
      return;
    }
    await handleVerify();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Verify Your Phone
          </h2>
          <p className="text-center text-gray-600">
            Enter the verification code sent to your phone
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <Form onSubmit={handleSubmit} loading={loading}>
          <FormField label="Verification Code" required>
            <Input
              name="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the 6-digit code"
              maxLength={6}
            />
          </FormField>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Verify Phone'}
          </Button>
        </Form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};