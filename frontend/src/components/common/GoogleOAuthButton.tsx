import React, { useEffect, useRef } from 'react';
import { useGoogleOAuth } from '../../hooks/useGoogleOAuth';
import type { GoogleCredentialResponse } from '../../hooks/useGoogleOAuth';

interface GoogleOAuthButtonProps {
  clientId: string;
  onSuccess: (response: GoogleCredentialResponse) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  clientId,
  onSuccess,
  onError,
  disabled = false,
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { isLoaded, error, initializeGoogleOAuth, renderGoogleButton } = useGoogleOAuth(clientId);

  useEffect(() => {
    if (isLoaded && buttonRef.current) {
      initializeGoogleOAuth(onSuccess);
      renderGoogleButton(buttonRef.current, {
        text,
        theme,
        size,
      });
    }
  }, [isLoaded, initializeGoogleOAuth, renderGoogleButton, onSuccess, text, theme, size]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Google OAuth Error: {error}
      </div>
    );
  }

  return (
    <div
      ref={buttonRef}
      className={`google-oauth-button ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    />
  );
};