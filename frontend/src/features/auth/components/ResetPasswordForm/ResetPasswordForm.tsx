import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { useAuthContext } from '@/contexts/AuthContext';
import type { PasswordResetOptions } from '@/types/auth';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

type ResetStep = 'options' | 'setup' | 'security-questions' | 'recovery-codes' | 'reset-via-questions' | 'reset-via-codes';

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSuccess,
  onBack
}) => {
  const {
    getPasswordResetOptions,
    disableResetMethod,
    setupSecurityQuestions,
    generateRecoveryCodes,
    resetPasswordViaSecurityQuestions,
    resetPasswordViaRecoveryCode,
    loading
  } = useAuthContext();

  const [step, setStep] = useState<ResetStep>('options');
  const [options, setOptions] = useState<PasswordResetOptions | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Setup forms
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);

  // Reset forms
  const [resetEmail, setResetEmail] = useState('');
  const [resetAnswers, setResetAnswers] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const loadOptions = useCallback(async () => {
    try {
      const opts = await getPasswordResetOptions();
      setOptions(opts);
    } catch (_err) {
      setError('Failed to load password reset options');
    }
  }, [getPasswordResetOptions]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleDisableMethod = async (methodType: string) => {
    try {
      const success = await disableResetMethod(methodType);
      if (success) {
        setSuccess(`${methodType.replace('_', ' ')} disabled successfully`);
        await loadOptions();
      }
    } catch (_err) {
      setError(`Failed to disable ${methodType}`);
    }
  };

  const handleSetupSecurityQuestions = async () => {
    if (securityQuestions.some(q => !q.question.trim() || !q.answer.trim())) {
      setError('All questions and answers are required');
      return;
    }

    try {
      const success = await setupSecurityQuestions({ questions: securityQuestions });
      if (success) {
        setSuccess('Security questions set up successfully');
        setStep('options');
        await loadOptions();
      }
    } catch (_err) {
      setError('Failed to set up security questions');
    }
  };

  const handleGenerateRecoveryCodes = async () => {
    try {
      const codes = await generateRecoveryCodes();
      setGeneratedCodes(codes);
      setSuccess('Recovery codes generated successfully. Save them in a secure place!');
      await loadOptions();
    } catch (_err) {
      setError('Failed to generate recovery codes');
    }
  };

  const handleResetViaSecurityQuestions = async () => {
    if (!resetEmail || resetAnswers.some(a => !a.question.trim() || !a.answer.trim()) || !newPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const success = await resetPasswordViaSecurityQuestions({
        email: resetEmail,
        answers: resetAnswers,
        newPassword
      });
      if (success) {
        setSuccess('Password reset successfully!');
        onSuccess?.();
      }
    } catch (_err) {
      setError('Password reset failed. Please check your answers.');
    }
  };

  const handleResetViaRecoveryCode = async () => {
    if (!resetEmail || !recoveryCode || !newPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const success = await resetPasswordViaRecoveryCode({
        email: resetEmail,
        recoveryCode,
        newPassword
      });
      if (success) {
        setSuccess('Password reset successfully!');
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

  const updateResetAnswer = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...resetAnswers];
    updated[index][field] = value;
    setResetAnswers(updated);
  };

  if (!options) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Password Reset Management
          </h2>
          <p className="text-center text-gray-600">
            {step === 'options' && 'Manage your password reset methods'}
            {step === 'setup' && 'Choose a reset method to set up'}
            {step === 'security-questions' && 'Set up security questions'}
            {step === 'recovery-codes' && 'Generate recovery codes'}
            {(step === 'reset-via-questions' || step === 'reset-via-codes') && 'Reset your password'}
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

        {step === 'options' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Reset Methods</h3>

            {/* Security Questions */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Security Questions</h4>
                  <p className="text-sm text-gray-600">
                    Answer personal questions to reset your password
                  </p>
                  {options.hasSecurityQuestions && (
                    <p className="text-sm text-green-600 mt-1">✓ Set up</p>
                  )}
                </div>
                <div className="space-x-2">
                  {!options.hasSecurityQuestions ? (
                    <Button
                      onClick={() => setStep('security-questions')}
                      variant="secondary"
                      size="sm"
                    >
                      Set Up
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => setStep('reset-via-questions')}
                        variant="default"
                        size="sm"
                      >
                        Use
                      </Button>
                      <Button
                        onClick={() => handleDisableMethod('security_questions')}
                        variant="secondary"
                        size="sm"
                        disabled={loading}
                      >
                        Disable
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Recovery Codes */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Recovery Codes</h4>
                  <p className="text-sm text-gray-600">
                    Use one-time codes to reset your password
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {options.recoveryCodesCount} codes remaining
                  </p>
                </div>
                <div className="space-x-2">
                  {options.recoveryCodesCount === 0 ? (
                    <Button
                      onClick={() => setStep('recovery-codes')}
                      variant="secondary"
                      size="sm"
                    >
                      Generate
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => setStep('reset-via-codes')}
                        variant="default"
                        size="sm"
                      >
                        Use
                      </Button>
                      <Button
                        onClick={() => handleGenerateRecoveryCodes()}
                        variant="secondary"
                        size="sm"
                        disabled={loading}
                      >
                        Regenerate
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Reset */}
            <div className="border rounded-lg p-4 bg-yellow-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Admin Reset</h4>
                  <p className="text-sm text-gray-600">
                    Contact an administrator to reset your password
                  </p>
                </div>
                <div className="text-sm text-yellow-700">
                  Available upon request
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'security-questions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Set Up Security Questions</h3>
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
                onClick={addSecurityQuestion}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Add Another Question
              </Button>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={handleSetupSecurityQuestions}
                variant="default"
                disabled={loading}
              >
                Save Questions
              </Button>
              <Button
                onClick={() => setStep('options')}
                variant="secondary"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 'recovery-codes' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generate Recovery Codes</h3>
            <p className="text-sm text-gray-600">
              Recovery codes are one-time use codes that can be used to reset your password.
              Save them in a secure place - you won't be able to see them again!
            </p>

            {generatedCodes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <h4 className="font-medium text-yellow-800 mb-2">Your Recovery Codes:</h4>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {generatedCodes.map((code, index) => (
                    <div key={index} className="bg-white p-2 rounded border">
                      {code}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  ⚠️ Save these codes now. They will not be shown again.
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={handleGenerateRecoveryCodes}
                variant="default"
                disabled={loading}
              >
                Generate Codes
              </Button>
              <Button
                onClick={() => setStep('options')}
                variant="secondary"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 'reset-via-questions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reset Password via Security Questions</h3>

            <Input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />

            {resetAnswers.map((a, index) => (
              <div key={index} className="space-y-2">
                <Input
                  value={a.question}
                  onChange={(e) => updateResetAnswer(index, 'question', e.target.value)}
                  placeholder="Enter your security question"
                  required
                />
                <Input
                  value={a.answer}
                  onChange={(e) => updateResetAnswer(index, 'answer', e.target.value)}
                  placeholder="Enter your answer"
                  required
                />
              </div>
            ))}

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
                onClick={handleResetViaSecurityQuestions}
                variant="default"
                disabled={loading}
              >
                Reset Password
              </Button>
              <Button
                onClick={() => setStep('options')}
                variant="secondary"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 'reset-via-codes' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reset Password via Recovery Code</h3>

            <Input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />

            <Input
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              placeholder="Enter one of your recovery codes"
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
                onClick={handleResetViaRecoveryCode}
                variant="default"
                disabled={loading}
              >
                Reset Password
              </Button>
              <Button
                onClick={() => setStep('options')}
                variant="secondary"
              >
                Back
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