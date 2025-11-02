import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
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
  const [formData, setFormData] = useState<UserRegistrationInput>({
    username: '',
    email: '',
    password: '',
    phone: '',
    registrationMethod: 'email'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Partial<UserRegistrationInput & { confirmPassword: string }>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Partial<UserRegistrationInput & { confirmPassword: string }> = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      const success = await register(formData);
      if (success) {
        onSuccess?.();
      } else {
        setSubmitError('Registration failed. Please try again.');
      }
    } catch (_error) {
      setSubmitError('An error occurred during registration. Please try again.');
    }
  };

  const handleInputChange = (field: keyof UserRegistrationInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: undefined
      }));
    }
  };

  const handleMethodChange = (method: 'email' | 'phone') => {
    setFormData(prev => ({
      ...prev,
      registrationMethod: method
    }));
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
      <form onSubmit={handleSubmit} className="space-y-6">
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
          <Input
            label="Username"
            type="text"
            value={formData.username}
            onChange={handleInputChange('username')}
            error={errors.username}
            placeholder="Choose a username"
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            placeholder="Enter your email"
            required
          />

          <Input
            label="Phone (Optional)"
            type="tel"
            value={formData.phone || ''}
            onChange={handleInputChange('phone')}
            error={errors.phone}
            placeholder="Enter your phone number"
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            placeholder="Create a password"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            required
          />
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
                checked={formData.registrationMethod === 'email'}
                onChange={() => handleMethodChange('email')}
                className="mr-2"
              />
              Email Verification
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="registrationMethod"
                value="phone"
                checked={formData.registrationMethod === 'phone'}
                onChange={() => handleMethodChange('phone')}
                className="mr-2"
              />
              Phone Verification
            </label>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          className="w-full"
          disabled={loading}
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
      </form>
    </div>
  );
};