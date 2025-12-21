/**
 * 🔐 Logging Consent Dialog
 * 
 * Asks user for permission to enable error logging features
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { consentManager } from '@/utils/consentManager';
import { featureFlags } from '@/utils/featureFlags';

interface ConsentDialogProps {
  onConsentGiven?: (consent: { localStorage: boolean; backendReporting: boolean }) => void;
}

export function ConsentDialog({ onConsentGiven }: ConsentDialogProps): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [localStorageConsent, setLocalStorageConsent] = useState(true);
  const [backendReportingConsent, setBackendReportingConsent] = useState(false);

  useEffect(() => {
    // Only show in production and if consent is required
    if (!featureFlags.requiresUserConsent()) {
      return;
    }

    // Check if we need to ask for consent
    const hasConsent = consentManager.hasBeenAsked();
    if (!hasConsent) {
      // Show dialog after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen for consent requests
    const handleConsentRequest = (): void => {
      setIsOpen(true);
    };

    window.addEventListener('logging:requestConsent', handleConsentRequest as EventListener);
    return () => {
      window.removeEventListener('logging:requestConsent', handleConsentRequest as EventListener);
    };
  }, []);

  const handleAccept = (): void => {
    consentManager.saveConsent({
      localStorage: localStorageConsent,
      backendReporting: backendReportingConsent,
    });

    // Update feature flags based on consent
    if (backendReportingConsent) {
      featureFlags.updateFlags({
        enableBackendReporting: true,
        enableLocalStorageLogging: localStorageConsent,
      });
    }

    onConsentGiven?.({
      localStorage: localStorageConsent,
      backendReporting: backendReportingConsent,
    });

    setIsOpen(false);
  };

  const handleDecline = (): void => {
    consentManager.saveConsent({
      localStorage: false,
      backendReporting: false,
    });

    onConsentGiven?.({
      localStorage: false,
      backendReporting: false,
    });

    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Help Us Improve
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Would you like to help us improve the app by allowing error reporting?
          This helps us fix issues faster and provide a better experience.
        </p>

        <div className="space-y-4 mb-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localStorageConsent}
              onChange={(e) => setLocalStorageConsent(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Save error logs locally</div>
              <div className="text-sm text-gray-500">
                Store error information in your browser to help with troubleshooting.
                Data stays on your device.
              </div>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={backendReportingConsent}
              onChange={(e) => setBackendReportingConsent(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Send error reports to us</div>
              <div className="text-sm text-gray-500">
                Automatically report errors to our server so we can fix them quickly.
                No personal data is collected.
              </div>
            </div>
          </label>
        </div>

        <div className="text-xs text-gray-500 mb-6 p-3 bg-gray-50 rounded">
          <strong>Privacy:</strong> We only collect error information (error messages and stack traces).
          No personal data, passwords, or sensitive information is ever collected.
          You can change these settings anytime.
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            No Thanks
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Accept
          </button>
        </div>

        <button
          onClick={handleDecline}
          className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Ask me later
        </button>
      </div>
    </div>
  );
}
