import React, { useState } from 'react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { useAuthContext } from '@/contexts/AuthContext';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

type ResetStep = 'email' | 'security-questions' | 'recovery-code';

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSuccess,
  onBack
}) => {
  const {
    resetPasswordViaSecurityQuestions,
    resetPasswordViaRecoveryCode,
    loading
  } = useAuthContext();

  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Security Questions reset
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Recovery Code reset
  const [recoveryCode, setRecoveryCode] = useState('');

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validatePasswordReset = (): boolean => {
    if (!newPassword) {
      setError('New password is required');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleEmailSubmit = () => {
    if (!validateEmail()) return;
    setError('');
    setSuccess('');
    // In a real app, you might check what reset methods are available for this email
    // For now, we'll show both options
    setStep('security-questions');
  };

  const handleSecurityQuestionsReset = async () => {
    if (!validateEmail() || !validatePasswordReset()) return;
    if (securityQuestions.some(q => !q.question.trim() || !q.answer.trim())) {
      setError('All questions and answers are required');
      return;
    }

    try {
      const success = await resetPasswordViaSecurityQuestions({
        email,
        answers: securityQuestions,
        newPassword
      });
      if (success) {
        setSuccess('Password reset successfully!');
        setError('');
        onSuccess?.();
      }
    } catch (_err) {
      setError('Password reset failed. Please check your answers.');
    }
  };

  const handleRecoveryCodeReset = async () => {
    if (!validateEmail() || !validatePasswordReset()) return;
    if (!recoveryCode) {
      setError('Recovery code is required');
      return;
    }

    try {
      const success = await resetPasswordViaRecoveryCode({
        email,
        recoveryCode,
        newPassword
      });
      if (success) {
        setSuccess('Password reset successfully!');
        setError('');
        onSuccess?.();
      }
    } catch (_err) {
      setError('Password reset failed. Please check your recovery code.');
    }
  };

  const addSecurityQuestion = () => {
    if (securityQuestions.length < 5) {
      setSecurityQuestions([...securityQuestions, { question: '', answer: '' }]);
    }
  };

  const updateSecurityQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...securityQuestions];
    updated[index][field] = value;
    setSecurityQuestions(updated);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-center text-gray-600">
            {step === 'email' && 'Enter your email address to reset your password'}
            {step === 'security-questions' && 'Answer your security questions'}
            {step === 'recovery-code' && 'Enter your recovery code'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full"
              onClick={handleEmailSubmit}
              disabled={loading}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'security-questions' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Answer your security questions to reset your password.
            </div>

            {securityQuestions.map((q, index) => (
              <div key={index} className="space-y-2">
                <Input
                  value={q.question}
                  onChange={(e) => updateSecurityQuestion(index, 'question', e.target.value)}
                  placeholder="Enter your security question"
                  required
                />
                <Input
                  value={q.answer}
                  onChange={(e) => updateSecurityQuestion(index, 'answer', e.target.value)}
                  placeholder="Enter your answer"
                  required
                />
              </div>
            ))}

            {securityQuestions.length < 5 && (
              <Button
                type="button"
                onClick={addSecurityQuestion}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Add Another Question
              </Button>
            )}

            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />

            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />

            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={handleSecurityQuestionsReset}
                variant="default"
                disabled={loading}
              >
                Reset Password
              </Button>
              <Button
                type="button"
                onClick={() => setStep('recovery-code')}
                variant="secondary"
              >
                Use Recovery Code Instead
              </Button>
            </div>
          </div>
        )}

        {step === 'recovery-code' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Enter one of your recovery codes to reset your password.
            </div>

            <Input
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              placeholder="Enter your recovery code"
              required
            />

            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />

            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />

            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={handleRecoveryCodeReset}
                variant="default"
                disabled={loading}
              >
                Reset Password
              </Button>
              <Button
                type="button"
                onClick={() => setStep('security-questions')}
                variant="secondary"
              >
                Use Security Questions Instead
              </Button>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};