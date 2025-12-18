import React from 'react';
import { Building2, Loader2 } from 'lucide-react';
import type { AuthLoadingProps } from './types';

export const AuthLoading: React.FC<AuthLoadingProps> = ({
  message = 'Signing you in...',
  variant = 'default'
}) => {
  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl animate-ping opacity-20" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </p>
      </div>
    );
  }

  if (variant === 'success') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="relative">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <div className="absolute inset-0 w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {message}
      </p>
    </div>
  );
};