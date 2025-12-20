import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export const useGoogleOAuth = (clientId: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = () => {
        setError('Failed to load Google Identity Services');
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const initializeGoogleOAuth = (callback: (response: GoogleCredentialResponse) => void) => {
    if (!isLoaded || !window.google?.accounts?.id) {
      setError('Google Identity Services not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: callback,
    });
  };

  const renderGoogleButton = (
    element: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      logo_alignment?: 'left' | 'center';
      width?: string;
      locale?: string;
    } = {}
  ) => {
    if (!isLoaded || !window.google?.accounts?.id) {
      setError('Google Identity Services not loaded');
      return;
    }

    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'center',
      ...options,
    });
  };

  return {
    isLoaded,
    error,
    initializeGoogleOAuth,
    renderGoogleButton,
  };
};