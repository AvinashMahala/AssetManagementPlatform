import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../../components/ui/input';
import { FormField } from '../../components/ui/form-field';
import { Form } from '../../components/ui/form';
import { useAuthContext } from '../../contexts/AuthContext';
import type { UpdateProfileRequest } from '../../services/authService';

interface ProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { user, updateProfile, loading } = useAuthContext();
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (user) {
      // No need to set form data since Form component handles it
    }
  }, [user]);

  const handleSubmit = async (data: Record<string, any>) => {
    setSubmitError('');
    setSuccess('');
    setErrors({});

    // Validate form data from the Form component
    const newErrors: Partial<Record<string, string>> = {};

    if (data.username && data.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (data.phone && !/^\+?[\d\s\-()]+$/.test(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const updateData: UpdateProfileRequest = {
        username: data.username || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined
      };
      const success = await updateProfile(updateData);
      if (success) {
        setSuccess('Profile updated successfully!');
        onSuccess?.();
      } else {
        setSubmitError('Failed to update profile');
      }
    } catch (_error) {
      setSubmitError('An error occurred while updating your profile. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="text-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Form onSubmit={handleSubmit} loading={loading}>
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
            {submitError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm mb-4">
            {success}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Email
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md text-sm">
              {user.email}
            </p>
          </div>

          <FormField label="Username">
            <Input
              name="username"
              type="text"
              defaultValue={user.username || ''}
              error={errors.username}
              placeholder="Enter your username"
            />
          </FormField>

          <FormField label="Email (changing email requires verification)">
            <Input
              name="email"
              type="email"
              defaultValue={user.email || ''}
              error={errors.email}
              placeholder="Enter your email"
            />
          </FormField>

          <FormField label="Phone">
            <Input
              name="phone"
              type="tel"
              defaultValue={user.phone || ''}
              error={errors.phone}
              placeholder="Enter your phone number"
            />
          </FormField>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <span>Email Verified:</span>
                <span>{user.isEmailVerified ? '✅' : '❌'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Phone Verified:</span>
                <span>{user.isPhoneVerified ? '✅' : '❌'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Role:</span>
                <span className="font-medium">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-4">
          <Button
            type="submit"
            variant="primary"
            size="medium"
            className="flex-1"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="medium"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};