import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '@/componentDesignLibrary';
import { FormField } from '@/componentDesignLibrary';
import { Form } from '@/componentDesignLibrary';
import { useAuthContext } from '../../contexts/AuthContext';

interface VerifyEmailFormProps {
  email?: string;
  onSuccess?: () => void;
  onResend?: () => void;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  email,
  onSuccess,
  onResend
}) => {
  const { verifyEmail, resendVerification, loading } = useAuthContext();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = useCallback(async (verificationToken?: string) => {
    const tokenToUse = verificationToken || token;
    if (!tokenToUse) {
      setError('Please enter the verification token');
      return;
    }

    try {
      const success = await verifyEmail(tokenToUse);
      if (success) {
        setSuccess('Email verified successfully! You can now sign in.');
        setError('');
        onSuccess?.();
      } else {
        setError('Invalid or expired verification token');
      }
    } catch (_err) {
      setError('Verification failed. Please try again.');
    }
  }, [token, verifyEmail, onSuccess]);

  useEffect(() => {
    // Check if there's a token in the URL (from email link)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      handleVerify(urlToken);
    }
  }, [handleVerify]);

  const handleSubmit = async (data: Record<string, any>) => {
    setError('');
    setSuccess('');

    // Validate form data
    if (!data.token) {
      setError('Please enter the verification token');
      return;
    }

    await handleVerify(data.token);
  };

  const handleResend = async () => {
    if (!email) {
      setError('No email address available for resend');
      return;
    }

    setResendLoading(true);
    try {
      const success = await resendVerification(email);
      if (success) {
        setSuccess('Verification email sent! Please check your inbox.');
        setError('');
        onResend?.();
      } else {
        setError('Failed to resend verification email');
      }
    } catch (_err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-center text-gray-600">
            {email ? `We've sent a verification code to ${email}` : 'Please enter the verification token from your email'}
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
          <FormField label="Verification Token" required>
            <Input
              name="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter the 6-digit code from your email"
            />
          </FormField>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </Form>

        {email && (
          <div className="text-center">
            <p className="text-gray-600 mb-3">
              Didn't receive the email?
            </p>
            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
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