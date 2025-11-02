import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
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
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    username: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<UpdateProfileRequest>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateProfileRequest> = {};

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      const success = await updateProfile(formData);
      if (success) {
        setSuccess('Profile updated successfully!');
        onSuccess?.();
      } else {
        setSubmitError('Failed to update profile');
      }
    } catch (error) {
      setSubmitError('An error occurred while updating your profile. Please try again.');
    }
  };

  const handleInputChange = (field: keyof UpdateProfileRequest) => (
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

  if (!user) {
    return (
      <div className="text-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Update Profile
          </h2>
          <p className="text-center text-gray-600">
            Update your account information below.
          </p>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {submitError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Email
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {user.email}
            </p>
          </div>

          <Input
            label="Username"
            type="text"
            value={formData.username || ''}
            onChange={handleInputChange('username')}
            error={errors.username}
            placeholder="Enter your username"
          />

          <Input
            label="Email (changing email requires verification)"
            type="email"
            value={formData.email || ''}
            onChange={handleInputChange('email')}
            error={errors.email}
            placeholder="Enter your email"
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone || ''}
            onChange={handleInputChange('phone')}
            error={errors.phone}
            placeholder="Enter your phone number"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Status
            </label>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Email Verified: {user.isEmailVerified ? '✅' : '❌'}
              </p>
              <p className="text-sm text-gray-600">
                Phone Verified: {user.isPhoneVerified ? '✅' : '❌'}
              </p>
              <p className="text-sm text-gray-600">
                Role: {user.role}
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="large"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};