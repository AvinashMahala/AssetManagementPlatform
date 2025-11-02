import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm, RegisterForm, PasswordResetForm } from '../../components/forms';
import { Card } from '../../components/common/Card';

type AuthView = 'login' | 'register' | 'reset-password';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleRegisterSuccess = () => {
    // After successful registration, show verification message
    // The user will need to verify their email/phone before they can login
    setCurrentView('login');
  };

  const handleResetPasswordSuccess = () => {
    setCurrentView('login');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView('register')}
            onForgotPassword={() => setCurrentView('reset-password')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      case 'reset-password':
        return (
          <PasswordResetForm
            onSuccess={handleResetPasswordSuccess}
            onBack={() => setCurrentView('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-8">
          {renderCurrentView()}
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};