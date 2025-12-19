import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '@/componentDesignLibrary';
import { FormField } from '@/componentDesignLibrary';
import { Form } from '@/componentDesignLibrary';
import { GoogleOAuthButton } from '../common/GoogleOAuthButton';
import { useAuthContext } from '../../contexts/AuthContext';
import type { UserRegistrationInput } from '../../services/authService';
import type { GoogleCredentialResponse } from '../../hooks/useGoogleOAuth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin
}) => {
  const { register, loading } = useAuthContext();
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (data: Record<string, any>) => {
    setSubmitError('');
    setErrors({});

    // Validate form data from the Form component
    const newErrors: Partial<Record<string, string>> = {};

    if (!data.username) {
      newErrors.username = 'Username is required';
    } else if (data.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

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

    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (data.phone && !/^\+?[\d\s\-()]+$/.test(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const registrationData: UserRegistrationInput = {
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone || '',
        registrationMethod: data.registrationMethod || 'email'
      };
      const success = await register(registrationData);
      if (success) {
        onSuccess?.();
      } else {
        setSubmitError('Registration failed. Please try again.');
      }
    } catch (_error) {
      setSubmitError('An error occurred during registration. Please try again.');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
  };

  const handleGoogleSuccess = async (response: GoogleCredentialResponse) => {
    try {
      setSubmitError('');
      // Decode the JWT token to get user profile
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const success = await register({
        username: payload.name.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substr(2, 4),
        name: payload.name, // Store the full display name
        email: payload.email,
        password: '', // Google OAuth doesn't require password
        phone: '',
        registrationMethod: 'google',
        googleId: payload.sub
      });

      if (success) {
        onSuccess?.();
      } else {
        setSubmitError('Google registration failed');
      }
    } catch (_error) {
      setSubmitError('An error occurred during Google registration. Please try again.');
    }
  };

  const handleGoogleError = (error: string) => {
    setSubmitError(`Google registration error: ${error}`);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form onSubmit={handleSubmit} loading={loading}>
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-center text-gray-600">
            Join us today! Create your account to get started.
          </p>
        </div>

        <div className="space-y-3">
          <GoogleOAuthButton
            clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "demo-client-id"}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={loading}
            text="signup_with"
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          <FormField label="Username" required>
            <Input
              name="username"
              type="text"
              error={errors.username}
              placeholder="Choose a username"
            />
          </FormField>

          <FormField label="Email" required>
            <Input
              name="email"
              type="email"
              error={errors.email}
              placeholder="Enter your email"
            />
          </FormField>

          <FormField label="Phone (Optional)">
            <Input
              name="phone"
              type="tel"
              error={errors.phone}
              placeholder="Enter your phone number"
            />
          </FormField>

          <FormField label="Password" required>
            <Input
              name="password"
              type="password"
              error={errors.password}
              placeholder="Create a password"
            />
          </FormField>

                    <FormField label="Confirm Password" required>
            <Input
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
            />
          </FormField>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Registration Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="registrationMethod"
                value="email"
                defaultChecked={true}
                className="mr-2"
              />
              Email Verification
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="registrationMethod"
                value="phone"
                className="mr-2"
              />
              Phone Verification
            </label>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="text-center">
          <span className="text-gray-600">Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign in
          </button>
        </div>
      </Form>
    </div>
  );
};