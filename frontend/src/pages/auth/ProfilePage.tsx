import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileForm, ResetPasswordForm } from '../../components/forms';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuthContext } from '../../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const handleUpdateSuccess = () => {
    // Profile updated successfully
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account information</p>
        </div>

        <Card className="p-8">
          <ProfileForm
            onSuccess={handleUpdateSuccess}
            onCancel={handleCancel}
          />
        </Card>

        <Card className="p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Password Reset Options</h3>
            <p className="text-sm text-gray-600 mb-6">
              Manage your password reset methods for account recovery.
            </p>
            <ResetPasswordForm
              onSuccess={() => {/* Handle success */}}
              onBack={() => {/* No back action needed */}}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <Button
                variant="secondary"
                size="medium"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Back to Dashboard
              </Button>

              <Button
                variant="danger"
                size="medium"
                onClick={handleLogout}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};