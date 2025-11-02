import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { IUserService } from '../interfaces/services/IUserService';
import { PasswordResetService } from '../services/PasswordResetService';

export const createAuthRoutes = (userService: IUserService, passwordResetService: PasswordResetService) => {
  const router = Router();
  const userController = new UserController(userService, passwordResetService);
  const authenticate = authMiddleware(userService);

  // Public routes (no authentication required)
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: ['Authentication']
   *     summary: Register a new user
   *     description: Create a new user account with email/phone verification
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserRegistrationInput'
   *           example:
   *             username: "johndoe"
   *             email: "john@example.com"
   *             password: "password123"
   *             phone: "+1234567890"
   *             registrationMethod: "email"
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         user:
   *                           $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/register', validateRequest.registration, userController.register.bind(userController));

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: ['Authentication']
   *     summary: User login
   *     description: Authenticate user and return JWT tokens
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserCredentials'
   *           example:
   *             email: "john@example.com"
   *             password: "password123"
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/login', validateRequest.login, userController.login.bind(userController));

  /**
   * @swagger
   * /api/auth/verify-email:
   *   post:
   *     tags: ['Authentication']
   *     summary: Verify email address
   *     description: Confirm email address using verification token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EmailVerificationConfirm'
   *           example:
   *             token: "abc123def456"
   *     responses:
   *       200:
   *         description: Email verified successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Invalid or expired token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/verify-email', validateRequest.verifyEmail, userController.verifyEmail.bind(userController));

  /**
   * @swagger
   * /api/auth/resend-verification:
   *   post:
   *     tags: ['Authentication']
   *     summary: Resend email verification
   *     description: Send a new email verification token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EmailVerificationRequest'
   *           example:
   *             email: "john@example.com"
   *     responses:
   *       200:
   *         description: Verification email sent
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Email already verified or user not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/resend-verification', validateRequest.resendVerification, userController.resendVerification.bind(userController));

  /**
   * @swagger
   * /api/auth/request-phone-verification:
   *   post:
   *     tags: ['Authentication']
   *     summary: Request phone verification
   *     description: Send SMS verification code to phone number
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PhoneVerificationRequest'
   *           example:
   *             phone: "+1234567890"
   *     responses:
   *       200:
   *         description: Verification code sent
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         code:
   *                           type: string
   *                           description: "Verification code (development only)"
   *       400:
   *         description: Invalid phone number
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/request-phone-verification', validateRequest.requestPhoneVerification, userController.requestPhoneVerification.bind(userController));

  /**
   * @swagger
   * /api/auth/verify-phone:
   *   post:
   *     tags: ['Authentication']
   *     summary: Verify phone number
   *     description: Confirm phone number using SMS verification code
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PhoneVerificationConfirm'
   *           example:
   *             phone: "+1234567890"
   *             code: "123456"
   *     responses:
   *       200:
   *         description: Phone verified successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Invalid or expired code
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/verify-phone', validateRequest.verifyPhone, userController.verifyPhone.bind(userController));

  /**
   * @swagger
   * /api/auth/password-reset-options:
   *   get:
   *     tags: ['Authentication']
   *     summary: Get password reset options
   *     description: Retrieve available password reset methods for the current user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Password reset options retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/PasswordResetOptions'
   */
  router.get('/password-reset-options', userController.getPasswordResetOptions.bind(userController));

  /**
   * @swagger
   * /api/auth/password-reset-methods/enable:
   *   post:
   *     tags: ['Authentication']
   *     summary: Enable password reset method
   *     description: Enable a specific password reset method for the current user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - methodType
   *             properties:
   *               methodType:
   *                 type: string
   *                 enum: ['security_questions', 'recovery_codes', 'admin_reset']
   *           example:
   *             methodType: "security_questions"
   *     responses:
   *       200:
   *         description: Password reset method enabled successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   */
  router.post('/password-reset-methods/enable', validateRequest.enableResetMethod, userController.enableResetMethod.bind(userController));

  /**
   * @swagger
   * /api/auth/password-reset-methods/disable:
   *   post:
   *     tags: ['Authentication']
   *     summary: Disable password reset method
   *     description: Disable a specific password reset method for the current user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - methodType
   *             properties:
   *               methodType:
   *                 type: string
   *                 enum: ['security_questions', 'recovery_codes', 'admin_reset']
   *           example:
   *             methodType: "recovery_codes"
   *     responses:
   *       200:
   *         description: Password reset method disabled successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   */
  router.post('/password-reset-methods/disable', validateRequest.disableResetMethod, userController.disableResetMethod.bind(userController));

  /**
   * @swagger
   * /api/auth/security-questions:
   *   post:
   *     tags: ['Authentication']
   *     summary: Setup security questions
   *     description: Set up security questions for password reset
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SecurityQuestionSetup'
   *           example:
   *             questions:
   *               - question: "What was your first pet's name?"
   *                 answer: "Fluffy"
   *               - question: "What city were you born in?"
   *                 answer: "New York"
   *     responses:
   *       200:
   *         description: Security questions set up successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   */
  router.post('/security-questions', validateRequest.setupSecurityQuestions, userController.setupSecurityQuestions.bind(userController));

  /**
   * @swagger
   * /api/auth/recovery-codes/generate:
   *   post:
   *     tags: ['Authentication']
   *     summary: Generate recovery codes
   *     description: Generate new recovery codes for password reset
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Recovery codes generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         recoveryCodes:
   *                           type: array
   *                           items:
   *                             type: string
   *                           description: "List of recovery codes (shown only once)"
   */
  router.post('/recovery-codes/generate', userController.generateRecoveryCodes.bind(userController));

  /**
   * @swagger
   * /api/auth/reset-password/security-questions:
   *   post:
   *     tags: ['Authentication']
   *     summary: Reset password via security questions
   *     description: Reset password by answering security questions
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PasswordResetViaSecurityQuestions'
   *           example:
   *             email: "john@example.com"
   *             answers:
   *               - question: "What was your first pet's name?"
   *                 answer: "Fluffy"
   *               - question: "What city were you born in?"
   *                 answer: "New York"
   *             newPassword: "newpassword123"
   *     responses:
   *       200:
   *         description: Password reset successfully via security questions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Invalid answers or user not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/reset-password/security-questions', validateRequest.resetPasswordViaSecurityQuestions, userController.resetPasswordViaSecurityQuestions.bind(userController));

  /**
   * @swagger
   * /api/auth/reset-password/recovery-code:
   *   post:
   *     tags: ['Authentication']
   *     summary: Reset password via recovery code
   *     description: Reset password using a recovery code
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PasswordResetViaRecoveryCode'
   *           example:
   *             email: "john@example.com"
   *             recoveryCode: "ABC123-DEF456"
   *             newPassword: "newpassword123"
   *     responses:
   *       200:
   *         description: Password reset successfully via recovery code
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Invalid recovery code or user not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/reset-password/recovery-code', validateRequest.resetPasswordViaRecoveryCode, userController.resetPasswordViaRecoveryCode.bind(userController));

  /**
   * @swagger
   * /api/auth/google-auth:
   *   post:
   *     tags: ['Authentication']
   *     summary: Google OAuth authentication
   *     description: Authenticate or register user with Google account
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/GoogleUserProfile'
   *           example:
   *             id: "123456789"
   *             email: "john@gmail.com"
   *             name: "John Doe"
   *             picture: "https://example.com/photo.jpg"
   *             verified_email: true
   *     responses:
   *       200:
   *         description: Google authentication successful
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AuthResponse'
   */
  router.post('/google-auth', validateRequest.googleAuth, userController.googleAuth.bind(userController));

  /**
   * @swagger
   * /api/auth/refresh-token:
   *   post:
   *     tags: ['Authentication']
   *     summary: Refresh access token
   *     description: Get new access token using refresh token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RefreshTokenRequest'
   *           example:
   *             refreshToken: "refresh-token-123"
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Invalid refresh token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
    router.post('/refresh-token', validateRequest.refreshToken, userController.refreshToken.bind(userController));

  // Password reset routes (some public, some protected)
  /**
   * @swagger
   * /api/auth/reset-password/security-questions:
   *   post:
   *     tags: ['Authentication']
   *     summary: Reset password via security questions
   *     description: Reset password by answering security questions
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PasswordResetViaSecurityQuestions'
   *           example:
   *             email: "john@example.com"
   *             answers:
   *               - question: "What was your first pet's name?"
   *                 answer: "Fluffy"
   *               - question: "What city were you born in?"
   *                 answer: "New York"
   *             newPassword: "newpassword123"
   *     responses:
   *       200:
   *         description: Password reset successfully via security questions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Invalid answers or user not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/reset-password/security-questions', validateRequest.resetPasswordViaSecurityQuestions, userController.resetPasswordViaSecurityQuestions.bind(userController));

  /**
   * @swagger
   * /api/auth/reset-password/recovery-code:
   *   post:
   *     tags: ['Authentication']
   *     summary: Reset password via recovery code
   *     description: Reset password using a recovery code
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PasswordResetViaRecoveryCode'
   *           example:
   *             email: "john@example.com"
   *             recoveryCode: "ABC123-DEF456"
   *             newPassword: "newpassword123"
   *     responses:
   *       200:
   *         description: Password reset successfully via recovery code
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Invalid recovery code or user not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/reset-password/recovery-code', validateRequest.resetPasswordViaRecoveryCode, userController.resetPasswordViaRecoveryCode.bind(userController));

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     tags: ['Authentication']
   *     summary: User logout
   *     description: Logout current user (client should discard tokens)
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   */
  router.post('/logout', userController.logout.bind(userController));

  // Protected routes (authentication required)
  router.use(authenticate); // All routes below require authentication

  /**
   * @swagger
   * /api/auth/password-reset-options:
   *   get:
   *     tags: ['Authentication']
   *     summary: Get password reset options
   *     description: Retrieve available password reset methods for the current user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Password reset options retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/PasswordResetOptions'
   */
  router.get('/password-reset-options', userController.getPasswordResetOptions.bind(userController));

  /**
   * @swagger
   * /api/auth/password-reset-methods/enable:
   *   post:
   *     tags: ['Authentication']
   *     summary: Enable password reset method
   *     description: Enable a specific password reset method for the current user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - methodType
   *             properties:
   *               methodType:
   *                 type: string
   *                 enum: ['security_questions', 'recovery_codes', 'admin_reset']
   *           example:
   *             methodType: "security_questions"
   *     responses:
   *       200:
   *         description: Password reset method enabled successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   */
  router.post('/password-reset-methods/enable', validateRequest.enableResetMethod, userController.enableResetMethod.bind(userController));

  /**
   * @swagger
   * /api/auth/password-reset-methods/disable:
   *   post:
   *     tags: ['Authentication']
   *     summary: Disable password reset method
   *     description: Disable a specific password reset method for the current user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - methodType
   *             properties:
   *               methodType:
   *                 type: string
   *                 enum: ['security_questions', 'recovery_codes', 'admin_reset']
   *           example:
   *             methodType: "recovery_codes"
   *     responses:
   *       200:
   *         description: Password reset method disabled successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   */
  router.post('/password-reset-methods/disable', validateRequest.disableResetMethod, userController.disableResetMethod.bind(userController));

  /**
   * @swagger
   * /api/auth/security-questions:
   *   post:
   *     tags: ['Authentication']
   *     summary: Setup security questions
   *     description: Set up security questions for password reset
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SecurityQuestionSetup'
   *           example:
   *             questions:
   *               - question: "What was your first pet's name?"
   *                 answer: "Fluffy"
   *               - question: "What city were you born in?"
   *                 answer: "New York"
   *     responses:
   *       200:
   *         description: Security questions set up successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   */
  router.post('/security-questions', validateRequest.setupSecurityQuestions, userController.setupSecurityQuestions.bind(userController));

  /**
   * @swagger
   * /api/auth/recovery-codes/generate:
   *   post:
   *     tags: ['Authentication']
   *     summary: Generate recovery codes
   *     description: Generate new recovery codes for password reset
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Recovery codes generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         recoveryCodes:
   *                           type: array
   *                           items:
   *                             type: string
   *                           description: "List of recovery codes (shown only once)"
   */
  router.post('/recovery-codes/generate', userController.generateRecoveryCodes.bind(userController));

  // Protected routes (authentication required)
  router.use(authenticate); // All routes below require authentication

  /**
   * @swagger
   * /api/auth/profile:
   *   get:
   *     tags: ['Authentication']
   *     summary: Get user profile
   *     description: Retrieve current user's profile information
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *   put:
   *     tags: ['Authentication']
   *     summary: Update user profile
   *     description: Update current user's profile information
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *           example:
   *             username: "newusername"
   *             email: "newemail@example.com"
   *             phone: "+1987654321"
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/profile', userController.getProfile.bind(userController));
  router.put('/profile', validateRequest.updateProfile, userController.updateProfile.bind(userController));

  /**
   * @swagger
   * /api/auth/link-google:
   *   post:
   *     tags: ['Authentication']
   *     summary: Link Google account
   *     description: Link Google account to current user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - googleId
   *             properties:
   *               googleId:
   *                 type: string
   *                 description: Google user ID
   *           example:
   *             googleId: "123456789"
   *     responses:
   *       200:
   *         description: Google account linked successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Google account already linked
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/link-google', validateRequest.linkGoogle, userController.linkGoogle.bind(userController));

  /**
   * @swagger
   * /api/auth/admin/reset-password:
   *   post:
   *     tags: ['Users']
   *     summary: Admin reset password
   *     description: Admin can reset a user's password and send them a temporary password (admin only)
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AdminPasswordReset'
   *           example:
   *             userId: 123
   *             sendEmail: true
   *     responses:
   *       200:
   *         description: Password reset successfully by admin
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         tempPassword:
   *                           type: string
   *                           description: "Temporary password (shown only to admin)"
   */
  router.post('/admin/reset-password', validateRequest.adminResetPassword, userController.adminResetPassword.bind(userController));

  // Admin only routes
  /**
   * @swagger
   * /api/auth:
   *   get:
   *     tags: ['Users']
   *     summary: Get all users
   *     description: Retrieve list of all users (admin only)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         users:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/User'
   */
  router.get('/', userController.getAllUsers.bind(userController));

  /**
   * @swagger
   * /api/auth/{id}:
   *   get:
   *     tags: ['Users']
   *     summary: Get user by ID
   *     description: Retrieve specific user information (admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: User ID
   *     responses:
   *       200:
   *         description: User information
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *   put:
   *     tags: ['Users']
   *     summary: Update user
   *     description: Update user information (admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserInput'
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *   delete:
   *     tags: ['Users']
   *     summary: Delete user
   *     description: Delete user account (admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: User ID
   *     responses:
   *       200:
   *         description: User deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/:id', userController.getUserById.bind(userController));
  router.put('/:id', validateRequest.updateUser, userController.updateUser.bind(userController));
  router.delete('/:id', userController.deleteUser.bind(userController));

  return router;
};