import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuthContext } from '../../contexts/AuthContext';

interface VerifyPhoneFormProps {
  phone?: string;
  onSuccess?: () => void;
  onRequestCode?: () => void;
}

export const VerifyPhoneForm: React.FC<VerifyPhoneFormProps> = ({
  phone,
  onSuccess,
  onRequestCode
}) => {
  const { requestPhoneVerification, verifyPhone, loading } = useAuthContext();
  const [phoneNumber, setPhoneNumber] = useState(phone || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'verify'>(phone ? 'verify' : 'request');

  const handleRequestCode = async () => {
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setRequestLoading(true);
    try {
      const success = await requestPhoneVerification(phoneNumber);
      if (success) {
        setSuccess('Verification code sent to your phone!');
        setError('');
        setStep('verify');
        onRequestCode?.();
      } else {
        setError('Failed to send verification code');
      }
    } catch (_err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!phoneNumber || !code) {
      setError('Please enter both phone number and verification code');
      return;
    }

    try {
      const success = await verifyPhone(phoneNumber, code);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'request') {
      await handleRequestCode();
    } else {
      await handleVerify();
    }
  };

  const handleBack = () => {
    setStep('request');
    setError('');
    setSuccess('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Verify Your Phone
          </h2>
          <p className="text-center text-gray-600">
            {step === 'request'
              ? 'Enter your phone number to receive a verification code'
              : `We've sent a code to ${phoneNumber}`
            }
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            required
            disabled={step === 'verify'}
          />

          {step === 'verify' && (
            <Input
              label="Verification Code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the 6-digit code"
              required
              maxLength={6}
            />
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            className="w-full"
            disabled={loading || requestLoading || (step === 'request' && !phoneNumber) || (step === 'verify' && (!phoneNumber || !code))}
          >
            {loading || requestLoading ? 'Processing...' :
             step === 'request' ? 'Send Code' : 'Verify Phone'}
          </Button>
        </form>

        {step === 'verify' && (
          <div className="text-center space-y-3">
            <p className="text-gray-600">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="secondary"
              size="medium"
              onClick={handleRequestCode}
              disabled={requestLoading}
            >
              {requestLoading ? 'Sending...' : 'Resend Code'}
            </Button>

            <div>
              <button
                type="button"
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Use Different Number
              </button>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};