import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateRequest = {
  // User registration validation
  registration: [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('phone')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please provide a valid phone number'),
    body('registrationMethod')
      .isIn(['email', 'phone', 'google'])
      .withMessage('Invalid registration method'),
    handleValidationErrors
  ],

  // User login validation
  login: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],

  // Email verification validation
  verifyEmail: [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required'),
    handleValidationErrors
  ],

  // Resend verification validation
  resendVerification: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    handleValidationErrors
  ],

  // Phone verification request validation
  requestPhoneVerification: [
    body('phone')
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please provide a valid phone number'),
    handleValidationErrors
  ],

  // Phone verification confirm validation
  verifyPhone: [
    body('code')
      .isLength({ min: 6, max: 6 })
      .withMessage('Verification code must be 6 digits')
      .isNumeric()
      .withMessage('Verification code must contain only numbers'),
    handleValidationErrors
  ],

  // Google authentication validation
  googleAuth: [
    body('id')
      .notEmpty()
      .withMessage('Google ID is required'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('name')
      .notEmpty()
      .withMessage('Name is required'),
    body('verified_email')
      .isBoolean()
      .withMessage('Verified email status is required'),
    handleValidationErrors
  ],

  // Token refresh validation
  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
    handleValidationErrors
  ],

  // Profile update validation
  updateProfile: [
    body('username')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phone')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please provide a valid phone number'),
    handleValidationErrors
  ],

  // Link Google account validation
  linkGoogle: [
    body('googleId')
      .notEmpty()
      .withMessage('Google ID is required'),
    handleValidationErrors
  ],

  // User update validation (admin)
  updateUser: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid user ID'),
    body('username')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('phone')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please provide a valid phone number'),
    body('role')
      .optional()
      .isIn(['admin', 'user'])
      .withMessage('Role must be either admin or user'),
    handleValidationErrors
  ],

  // Password reset method validation
  enableResetMethod: [
    body('methodType')
      .isIn(['security_questions', 'recovery_codes', 'admin_reset'])
      .withMessage('Invalid password reset method type'),
    handleValidationErrors
  ],

  // Password reset method validation
  disableResetMethod: [
    body('methodType')
      .isIn(['security_questions', 'recovery_codes', 'admin_reset'])
      .withMessage('Invalid password reset method type'),
    handleValidationErrors
  ],

  // Security questions setup validation
  setupSecurityQuestions: [
    body('questions')
      .isArray({ min: 2, max: 5 })
      .withMessage('Must provide between 2 and 5 security questions'),
    body('questions.*.question')
      .isLength({ min: 10, max: 200 })
      .withMessage('Security question must be between 10 and 200 characters'),
    body('questions.*.answer')
      .isLength({ min: 1, max: 100 })
      .withMessage('Security answer must be between 1 and 100 characters'),
    handleValidationErrors
  ],

  // Password reset via security questions validation
  resetPasswordViaSecurityQuestions: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('answers')
      .isArray({ min: 2 })
      .withMessage('Must provide answers to at least 2 security questions'),
    body('answers.*.question')
      .notEmpty()
      .withMessage('Security question is required'),
    body('answers.*.answer')
      .notEmpty()
      .withMessage('Security answer is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
    handleValidationErrors
  ],

  // Password reset via recovery code validation
  resetPasswordViaRecoveryCode: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('recoveryCode')
      .notEmpty()
      .withMessage('Recovery code is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
    handleValidationErrors
  ],

  // Admin password reset validation
  adminResetPassword: [
    body('userId')
      .isInt({ min: 1 })
      .withMessage('Valid user ID is required'),
    body('sendEmail')
      .optional()
      .isBoolean()
      .withMessage('sendEmail must be a boolean'),
    handleValidationErrors
  ]
};