import { useState } from 'react';

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
}

export const useAuthFlow = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });

  const [currentStep, setCurrentStep] = useState<'welcome' | 'login' | 'register' | 'verify' | 'success'>('welcome');

  const login = async (credentials: { email: string; password: string }) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful login
      setAuthState({
        isAuthenticated: true,
        user: { email: credentials.email, name: 'Demo User' },
        loading: false,
        error: null
      });

      setCurrentStep('success');
      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid credentials'
      }));
      return false;
    }
  };

  const register = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setAuthState(prev => ({ ...prev, loading: false }));
      setCurrentStep('verify');
      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Registration failed'
      }));
      return false;
    }
  };

  const resetPassword = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAuthState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Reset failed'
      }));
      return false;
    }
  };

  const verifyCode = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAuthState({
        isAuthenticated: true,
        user: { email: 'user@example.com', name: 'Verified User' },
        loading: false,
        error: null
      });
      setCurrentStep('success');
      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid code'
      }));
      return false;
    }
  };

  return {
    authState,
    currentStep,
    setCurrentStep,
    login,
    register,
    resetPassword,
    verifyCode
  };
};