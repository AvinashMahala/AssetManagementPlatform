/**
 * 🔐 Logging Consent Dialog
 * 
 * Asks user for permission to enable error logging features
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Settings, Minimize2, Maximize2, X } from 'lucide-react';
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

/**
 * 🎛️ Advanced Dev Tools Component
 * Floating, draggable, shrinkable development tools with hotkey toggle
 */

interface DevToolsProps {}

export function DevTools({}: DevToolsProps): ReactNode {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [, forceUpdate] = useState({});
  const devToolsRef = useRef<HTMLDivElement>(null);

  // Environment variable configuration
  const showDevToolsByDefault = import.meta.env.VITE_SHOW_DEV_TOOLS === 'true';
  const devToolsHotkey = import.meta.env.VITE_DEV_TOOLS_HOTKEY || 'F12';

  // Only show in development or if explicitly enabled
  const shouldShow = import.meta.env.DEV || showDevToolsByDefault;

  useEffect(() => {
    if (!shouldShow) return;

    // Set initial visibility based on environment
    setIsVisible(showDevToolsByDefault);

    // Hotkey listener
    const handleKeyDown = (e: KeyboardEvent) => {
      const hotkeyParts = devToolsHotkey.split('+');
      const requiredKeys = hotkeyParts.map((key: string) => key.toLowerCase());

      // Check if all required modifier keys are pressed
      const modifiersPressed = {
        ctrl: e.ctrlKey || e.metaKey, // metaKey for Cmd on Mac
        shift: e.shiftKey,
        alt: e.altKey,
      };

      // Check modifiers
      const modifierKeys = requiredKeys.filter((key: string) => ['ctrl', 'shift', 'alt', 'meta'].includes(key));
      const hasAllModifiers = modifierKeys.every((mod: string) => modifiersPressed[mod as keyof typeof modifiersPressed]);

      // Check main key
      const mainKey = requiredKeys.find((key: string) => !['ctrl', 'shift', 'alt', 'meta'].includes(key));
      const mainKeyPressed = mainKey && (
        (e.key && e.key.toLowerCase() === mainKey) ||
        (e.code && e.code.toLowerCase().replace('key', '') === mainKey)
      );

      if (hasAllModifiers && mainKeyPressed) {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldShow, showDevToolsByDefault, devToolsHotkey]);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMinimized) return;

    setIsDragging(true);
    const rect = devToolsRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [isMinimized]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - (isMinimized ? 50 : 400);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  }, [isDragging, dragOffset, isMinimized]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const toggleFlag = (flag: keyof ReturnType<typeof featureFlags.getFlags>): void => {
    const flags = featureFlags.getFlags();
    featureFlags.updateFlags({ [flag]: !flags[flag] });
    forceUpdate({});
  };

  if (!shouldShow || !isVisible) {
    return null;
  }

  const flags = featureFlags.getFlags();
  const consent = consentManager.getConsent();

  return (
    <div
      ref={devToolsRef}
      className={`fixed z-[9999] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl transition-all duration-200 ${
        isMinimized ? 'w-64 h-12' : 'w-80 h-auto max-h-[70vh]'
      }`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg cursor-move border-b border-gray-200 dark:border-gray-700"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            Dev Tools
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
            {devToolsHotkey}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            ) : (
              <Minimize2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
            title="Close (Hotkey: F12)"
          >
            <X className="w-3 h-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Content - Hidden when minimized */}
      {!isMinimized && (
        <div className="p-4 overflow-y-auto max-h-[calc(70vh-3rem)]">
          <div className="space-y-4">
            {/* Environment Info */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                Environment
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>Mode: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  {import.meta.env.MODE}
                </span></div>
                <div>Dev: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  {import.meta.env.DEV ? 'true' : 'false'}
                </span></div>
                <div>Hotkey: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  {devToolsHotkey}
                </span></div>
              </div>
            </div>

            {/* Feature Flags */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                Feature Flags
              </h4>
              <div className="space-y-2">
                {Object.entries(flags).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">
                      {key}
                    </span>
                    <button
                      onClick={() => toggleFlag(key as keyof typeof flags)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            {/* User Consent */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                User Consent
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                <div className="flex justify-between">
                  <span>Local Storage:</span>
                  <span className={`font-mono ${
                    consent.localStorage === true ? 'text-green-600' :
                    consent.localStorage === false ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {consent.localStorage === true ? '✓' : consent.localStorage === false ? '✗' : '?'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Backend Reporting:</span>
                  <span className={`font-mono ${
                    consent.backendReporting === true ? 'text-green-600' :
                    consent.backendReporting === false ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {consent.backendReporting === true ? '✓' : consent.backendReporting === false ? '✗' : '?'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  consentManager.clearConsent();
                  window.location.reload();
                }}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
              >
                Clear Consent & Reload
              </button>

              <button
                onClick={() => {
                  featureFlags.reset();
                  window.location.reload();
                }}
                className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
              >
                Reset Flags & Reload
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors"
              >
                Clear Storage & Reload
              </button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <div className="font-semibold mb-1">Controls:</div>
              <div>• Drag header to move</div>
              <div>• Click minimize to collapse</div>
              <div>• Press <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">{devToolsHotkey}</kbd> to toggle</div>
            </div>
          </div>
        </div>
      )}

      {/* Minimized indicator */}
      {isMinimized && (
        <div className="flex items-center justify-center h-full text-xs text-gray-500 dark:text-gray-400">
          Dev Tools (Minimized)
        </div>
      )}
    </div>
  );
}
