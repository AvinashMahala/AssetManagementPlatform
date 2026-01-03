import React, { useState, useMemo } from 'react';
import zxcvbn from 'zxcvbn';
import { Check } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { FormField } from '@/componentDesignLibrary';
import { Form } from '@/componentDesignLibrary';
import { GoogleOAuthButton } from '@/features/auth/components/GoogleOAuthButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import type { UserRegistrationInput } from '@/features/auth/types/auth';
import type { GoogleCredentialResponse } from '@/features/auth/hooks/useGoogleOAuth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin
}) => {
  const { register, loading } = useAuthContext();
  const { showSuccess, showError } = useNotifications();
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  // Email / Username mirroring state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [passwordValue, setPasswordValue] = useState('');
  const score = useMemo(() => zxcvbn(passwordValue), [passwordValue]);
  const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (data: Record<string, any>) => {
    setSubmitError('');
    setErrors({});

    // Validate form data from the Form component
    const newErrors: Partial<Record<string, string>> = {};

    if (!data.username) {
      newErrors.username = 'Username is required';
    } else if (data.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(data.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(data.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(data.password)) {
      newErrors.password = 'Password must contain a number';
    } else if (!/[^A-Za-z0-9]/.test(data.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    // Update interactive strength meter value
    setPasswordValue(data.password || '');

    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (data.phone && !/^\+?[\d\s\-()]+$/.test(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const registrationData: UserRegistrationInput = {
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone || '',
        registrationMethod: data.registrationMethod || 'email'
      };
        const result = await register(registrationData);
      if (result.success) {
        showSuccess('Account Created', 'Please check your email or phone to verify your account.');
        // Clear form fields and local state
        try { formRef.current?.reset(); } catch (_e) {}
        setConfirmPassword('');
        setPasswordValue('');
        setSubmitError('');
        setErrors({});
        onSuccess?.();
        // Switch to Sign In tab if requested
        onSwitchToLogin?.();
      } else {
        const msg = result.error ?? 'Registration failed. Please try again.';
        // If server sent field-level validation errors, show them inline
        if (result.fieldErrors) {
          const mapped: Partial<Record<string, string>> = {};
          for (const k of Object.keys(result.fieldErrors)) {
            const arr = result.fieldErrors[k];
            mapped[k] = Array.isArray(arr) && arr.length > 0 ? arr.join(' ') : '';
          }
          setErrors(mapped);
        }
        setSubmitError(msg);
        showError('Registration Failed', msg);
      }
    } catch (_error) {
      setSubmitError('An error occurred during registration. Please try again.');
    }
  };

  const validatePasswordMatch = (pw: string, conf: string) => {
    setErrors(prev => {
      const next: Partial<Record<string, string>> = { ...prev };
      // Only show mismatch after user has started typing into confirm field
      if (!confirmTouched || !conf) {
        delete next.confirmPassword;
      } else if (pw !== conf) {
        next.confirmPassword = 'Passwords do not match';
      } else {
        delete next.confirmPassword;
      }
      return next;
    });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (!confirmTouched && value.length > 0) setConfirmTouched(true);
    validatePasswordMatch(passwordValue, value);
  };

  const handleGoogleSuccess = async (response: GoogleCredentialResponse) => {
    try {
      setSubmitError('');
      // Decode the JWT token to get user profile
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const result = await register({
        username: payload.name.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substr(2, 4),
        name: payload.name, // Store the full display name
        email: payload.email,
        password: '', // Google OAuth doesn't require password
        phone: '',
        registrationMethod: 'google',
        googleId: payload.sub
      });

      if (result.success) {
        showSuccess('Account Created', 'Google registration succeeded. Check your inbox if verification is required.');
        onSuccess?.();
      } else {
        const msg = result.error ?? 'Google registration failed';
        setSubmitError(msg);
        showError('Google Registration Failed', msg);
      }
    } catch (_error) {
      setSubmitError('An error occurred during Google registration. Please try again.');
    }
  };

  const handleGoogleError = (error: string) => {
    setSubmitError(`Google registration error: ${error}`);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form ref={formRef} onSubmit={handleSubmit} loading={loading}>
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-center text-gray-600">
            Join us today! Create your account to get started.
          </p>
        </div>

        <div className="space-y-3">
          <GoogleOAuthButton
            clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "demo-client-id"}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={loading}
            text="signup_with"
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          <FormField label="Email" required>
            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const v = e.target.value; setEmail(v); if (!usernameTouched) setUsername(v); }}
              onBlur={() => { if (!usernameTouched) setUsername(email); }}
              error={errors.email}
              placeholder="Enter your email"
            />
          </FormField>

          <FormField label="Username" required>
            <Input
              name="username"
              type="text"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setUsername(e.target.value); setUsernameTouched(true); }}
              onFocus={() => setUsernameTouched(true)}
              error={errors.username}
              placeholder="Choose a username"
            />
          </FormField>

          <FormField label="Phone (Optional)">
            <Input
              name="phone"
              type="tel"
              error={errors.phone}
              placeholder="Enter your phone number"
            />
          </FormField>

          <FormField label="Password" required>
            <Input
              name="password"
              type="password"
              error={errors.password}
              placeholder="Create a password"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const v = e.target.value; setPasswordValue(v); validatePasswordMatch(v, confirmPassword); }}
            />
            {/* Strength Meter */}
            {passwordValue && (
              <div className="mt-2">
                <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${['from-red-500 to-red-400','from-orange-400 to-orange-300','from-yellow-400 to-yellow-300','from-green-400 to-green-300','from-green-600 to-green-500'][score.score]} `} style={{ width: `${(score.score+1)/5*100}%` }} />
                </div>
                <div className="text-xs text-gray-600 mt-1 flex items-center justify-between">
                  <span>{strengthLabels[score.score]}</span>
                  {score.feedback && score.feedback.warning && <span className="text-xs text-yellow-700">{score.feedback.warning}</span>}
                </div>
              </div>
            )}
          </FormField>

                    <FormField label="Confirm Password" required>
            <Input
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              endIcon={confirmTouched && passwordValue && passwordValue === confirmPassword ? <Check className="h-4 w-4 text-green-500" /> : undefined}
            />
          </FormField>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Registration Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="registrationMethod"
                value="email"
                defaultChecked={true}
                className="mr-2"
              />
              Email Verification
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="registrationMethod"
                value="phone"
                className="mr-2"
              />
              Phone Verification
            </label>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="text-center">
          <span className="text-gray-600">Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign in
          </button>
        </div>
      </Form>
    </div>
  );
};