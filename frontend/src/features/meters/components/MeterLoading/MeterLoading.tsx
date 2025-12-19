import React from 'react';

interface MeterLoadingProps {
  message?: string;
  subMessage?: string;
}

export const MeterLoading: React.FC<MeterLoadingProps> = ({ 
  message = "Loading...", 
  subMessage 
}) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
        {subMessage && <p className="text-sm text-gray-500 mt-2">{subMessage}</p>}
      </div>
    </div>
  );
};
