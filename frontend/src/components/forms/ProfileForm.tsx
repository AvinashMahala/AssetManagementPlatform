import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '@/componentDesignLibrary';
import { FormField } from '@/componentDesignLibrary';
import { Form } from '@/componentDesignLibrary';
import { LoadingSpinner, ValidationFeedback, EmailVerificationStatus, useRealTimeValidation, ExpandableSection, Tooltip } from '@/componentDesignLibrary';
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
  const [submitError, setSubmitError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Real-time validation for form fields
  const usernameValidation = useRealTimeValidation(
    user?.username || '',
    (value) => {
      if (value && value.length < 3) return 'Username must be at least 3 characters';
      if (value && !/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
      return null;
    }
  );

  const emailValidation = useRealTimeValidation(
    user?.email || '',
    (value) => {
      if (value && !/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
      return null;
    }
  );

  const phoneValidation = useRealTimeValidation(
    user?.phone || '',
    (value) => {
      if (value && !/^\+?[\d\s\-()]+$/.test(value)) return 'Please enter a valid phone number';
      return null;
    }
  );

  const handleSubmit = async () => {
    setSubmitError('');
    setSuccess('');

    // Validate all fields
    const validations = [usernameValidation, emailValidation, phoneValidation];
    const allValid = validations.every(v => v.validate());

    if (!allValid) {
      setSubmitError('Please fix the validation errors before submitting.');
      return;
    }

    try {
      const updateData: UpdateProfileRequest = {
        username: usernameValidation.value || undefined,
        email: emailValidation.value || undefined,
        phone: phoneValidation.value || undefined
      };

      const success = await updateProfile(updateData);
      if (success) {
        setSuccess('Profile updated successfully!');
        setRetryCount(0);
        onSuccess?.();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating your profile. Please try again.';
      setSubmitError(errorMessage);
      setRetryCount(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setSubmitError('');
    // Retry logic would go here - could resubmit the form or refresh data
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
          <ValidationFeedback
            type="error"
            message={submitError}
            onDismiss={() => setSubmitError('')}
            className="mb-4"
          />
        )}

        {success && (
          <ValidationFeedback
            type="success"
            message={success}
            onDismiss={() => setSuccess('')}
            autoHide={true}
            autoHideDelay={3000}
            className="mb-4"
          />
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
            <Tooltip content="Your unique username (3-20 characters, letters, numbers, and underscores only)">
              <div>
                <Input
                  name="username"
                  type="text"
                  value={usernameValidation.value}
                  onChange={(e) => usernameValidation.handleChange(e.target.value)}
                  onBlur={usernameValidation.handleBlur}
                  error={usernameValidation.error || undefined}
                  placeholder="Enter your username"
                />
              </div>
            </Tooltip>
          </FormField>

          <FormField label="Email (changing email requires verification)">
            <Tooltip content="Your email address for account access and notifications. Changes require email verification.">
              <div>
                <Input
                  name="email"
                  type="email"
                  value={emailValidation.value}
                  onChange={(e) => emailValidation.handleChange(e.target.value)}
                  onBlur={emailValidation.handleBlur}
                  error={emailValidation.error || undefined}
                  placeholder="Enter your email"
                />
              </div>
            </Tooltip>
          </FormField>

          <FormField label="Phone">
            <Tooltip content="Your phone number for account recovery and SMS notifications (optional)">
              <div>
                <Input
                  name="phone"
                  type="tel"
                  value={phoneValidation.value}
                  onChange={(e) => phoneValidation.handleChange(e.target.value)}
                  onBlur={phoneValidation.handleBlur}
                  error={phoneValidation.error || undefined}
                  placeholder="Enter your phone number"
                />
              </div>
            </Tooltip>
          </FormField>

          {/* Email Verification Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Verification
            </label>
            <EmailVerificationStatus
              isVerified={user.isEmailVerified || false}
              email={user.email}
              onResendVerification={() => {
                // TODO: Implement email verification resend

              }}
            />
          </div>

          {/* Account Details - Expandable Section */}
          <ExpandableSection
            title="Account Details & Status"
            defaultExpanded={false}
            className="mt-6"
            headerClassName="bg-gray-50/50 dark:bg-gray-800/50"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <Tooltip content="Email verification status - verified accounts have full access to all features">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <span className="text-gray-600 dark:text-gray-400">Email Verified:</span>
                    <span className={`font-medium ${user.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isEmailVerified ? '✅ Verified' : '❌ Unverified'}
                    </span>
                  </div>
                </Tooltip>
                <Tooltip content="Phone verification status - enhances account security">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <span className="text-gray-600 dark:text-gray-400">Phone Verified:</span>
                    <span className={`font-medium ${user.isPhoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isPhoneVerified ? '✅ Verified' : '❌ Unverified'}
                    </span>
                  </div>
                </Tooltip>
                <Tooltip content="Your account role and permission level">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <span className="text-gray-600 dark:text-gray-400">Account Role:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{user.role}</span>
                  </div>
                </Tooltip>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Tooltip content="Date when you first created your account">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <span className="text-gray-600 dark:text-gray-400">Account Created:</span>
                    <span className="font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </Tooltip>
                <Tooltip content="Last time you logged into the system">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
                    <span className="font-medium">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </Tooltip>
              </div>
            </div>
          </ExpandableSection>
        </div>

        <div className="flex space-x-3 mt-4">
          <Button
            type="submit"
            variant="default"
            size="default"
            className="flex-1"
            disabled={loading || !usernameValidation.isValid || !emailValidation.isValid || !phoneValidation.isValid}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Updating...</span>
              </div>
            ) : (
              'Update Profile'
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="default"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>

        {retryCount > 0 && submitError && (
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRetry}
              className="w-full flex items-center justify-center space-x-2"
            >
              <span>Retry ({retryCount}/3)</span>
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};