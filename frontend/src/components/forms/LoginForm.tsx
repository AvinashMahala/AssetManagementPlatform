import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../../components/ui/input';
import { FormField } from '../../components/ui/form-field';
import { Form } from '../../components/ui/form';
import { GoogleOAuthButton } from '../common/GoogleOAuthButton';
import { useAuthContext } from '../../contexts';
import type { UserCredentials } from '../../types/user';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onForgotPassword
}) => {
  const { login, googleAuth, loading, devModeLogin } = useAuthContext();
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const handleSubmit = async (data: Record<string, any>) => {
    setSubmitError('');
    setErrors({});

    // Validate form data
    const newErrors: Partial<Record<string, string>> = {};

    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const success = await login(data as UserCredentials);
      if (success) {
        onSuccess?.();
      } else {
        setSubmitError('Invalid email or password');
      }
    } catch (_error) {
      setSubmitError('An error occurred during login. Please try again.');
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      console.log('[LoginForm.handleGoogleSuccess] Raw Google response:', response);
      setSubmitError('');
      // Decode the JWT token to get user profile
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      console.log('[LoginForm.handleGoogleSuccess] Decoded payload:', payload);

      const googleProfile = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        verified_email: payload.email_verified || true
      };
      console.log('[LoginForm.handleGoogleSuccess] Google profile:', googleProfile);

      const success = await googleAuth(googleProfile);
      console.log('[LoginForm.handleGoogleSuccess] GoogleAuth result:', success);

      if (success) {
        onSuccess?.();
      } else {
        setSubmitError('Google authentication failed');
      }
    } catch (error) {
      console.error('[LoginForm.handleGoogleSuccess] Error:', error);
      setSubmitError('An error occurred during Google authentication. Please try again.');
    }
  };

  const handleGoogleError = (error: string) => {
    setSubmitError(`Google authentication error: ${error}`);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form onSubmit={handleSubmit} loading={loading}>
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Sign In
          </h2>
          <p className="text-center text-gray-600">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          <FormField label="Email" required>
            <Input
              name="email"
              type="email"
              error={errors.email}
              placeholder="Enter your email"
            />
          </FormField>

          <FormField label="Password" required>
            <Input
              name="password"
              type="password"
              error={errors.password}
              placeholder="Enter your password"
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        {/* Development mode skip button */}
        {import.meta.env.DEV && (
          <Button
            type="button"
            variant="secondary"
            size="large"
            className="w-full"
            onClick={() => {
              devModeLogin();
              onSuccess?.();
            }}
            disabled={loading}
          >
            🚀 Skip Sign In (Dev Mode)
          </Button>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <GoogleOAuthButton
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          disabled={loading}
          text="signin_with"
        />

        <div className="text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign up
          </button>
        </div>
      </Form>
    </div>
  );
};