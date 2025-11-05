import { Request, Response } from 'express';
import { IUserService } from '../interfaces/services/IUserService.js';
import { PasswordResetService } from '../services/PasswordResetService.js';
import {
  UserInput,
  UserCredentials,
  UserRegistrationInput,
  GoogleUserProfile,
  AuthResponse,
  EmailVerificationRequest,
  EmailVerificationConfirm,
  PhoneVerificationRequest,
  PhoneVerificationConfirm,
  PasswordResetOptions,
  SecurityQuestionSetup,
  PasswordResetViaSecurityQuestions,
  PasswordResetViaRecoveryCode,
  AdminPasswordReset
} from '../models/User.js';
import { ResponseUtils } from '../utils/response.js';
import { ErrorUtils } from '../utils/error.js';

export class UserController {
  private service: IUserService;
  private passwordResetService: PasswordResetService;

  constructor(service: IUserService, passwordResetService: PasswordResetService) {
    this.service = service;
    this.passwordResetService = passwordResetService;
  }

  // Basic CRUD operations
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.service.getAllUsers();
      ResponseUtils.success(res, { users });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch users');
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await this.service.getUserById(id);
      if (!user) {
        return ResponseUtils.notFound(res, 'User not found');
      }
      ResponseUtils.success(res, user);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to fetch user');
      }
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const userData: UserInput = req.body;
      const user = await this.service.createUser(userData);
      ResponseUtils.created(res, user, 'User created successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('already exists') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleDatabaseError(res, err);
      }
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: Partial<UserInput> = req.body;
      const user = await this.service.updateUser(id, updateData);
      if (!user) {
        return ResponseUtils.notFound(res, 'User not found');
      }
      ResponseUtils.success(res, user, 'User updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid') || errorMessage.includes('already exists') ||
          errorMessage.includes('must be') || errorMessage.includes('cannot be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleDatabaseError(res, err);
      }
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await this.service.deleteUser(id);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'User not found');
      }
      ResponseUtils.success(res, { message: 'User deleted successfully' });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to delete user');
      }
    }
  }

  // Authentication methods
  async register(req: Request, res: Response) {
    try {
      const userData: UserRegistrationInput = req.body;
      const user = await this.service.registerUser(userData);
      ResponseUtils.created(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          createdAt: user.createdAt
        },
        message: 'User registered successfully. Please check your email for verification.'
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('already exists') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleDatabaseError(res, err);
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      console.log('🚀 Login request received:', req.body);
      const credentials: UserCredentials = req.body;
      const authResponse = await this.service.loginUser(credentials);
      if (!authResponse) {
        console.log('❌ Login failed - invalid credentials');
        return ResponseUtils.unauthorized(res, 'Invalid email or password');
      }
      console.log('✅ Login successful for user:', credentials.email);
      ResponseUtils.success(res, authResponse, 'Login successful');
    } catch (err) {
      console.error('💥 Login error:', err);
      ErrorUtils.handleGenericError(res, err, 'Login failed');
    }
  }

  async logout(req: Request, res: Response) {
    try {
      // For logout, we don't need to do anything server-side
      // The client will discard the tokens
      ResponseUtils.success(res, { message: 'Logout successful' });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Logout failed');
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token }: EmailVerificationConfirm = req.body;
      const verified = await this.service.verifyEmail(token);
      if (!verified) {
        return ResponseUtils.badRequest(res, 'Invalid or expired verification token');
      }
      ResponseUtils.success(res, { message: 'Email verified successfully' });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Email verification failed');
    }
  }

  async resendVerification(req: Request, res: Response) {
    try {
      const { email }: EmailVerificationRequest = req.body;
      const success = await this.service.resendEmailVerification(email);
      if (!success) {
        return ResponseUtils.badRequest(res, 'Failed to resend verification email');
      }
      ResponseUtils.success(res, { message: 'Verification email sent successfully' });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('not found') || errorMessage.includes('already verified')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to resend verification email');
      }
    }
  }

  async requestPhoneVerification(req: Request, res: Response) {
    try {
      const { phone }: PhoneVerificationRequest = req.body;
      const code = await this.service.requestPhoneVerification(phone);
      // In production, send SMS here instead of returning the code
      ResponseUtils.success(res, {
        message: 'Verification code sent successfully',
        // Remove this in production - only for development
        code: process.env.NODE_ENV === 'development' ? code : undefined
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to send verification code');
      }
    }
  }

  async verifyPhone(req: Request, res: Response) {
    try {
      const { phone, code }: PhoneVerificationConfirm = req.body;
      const verified = await this.service.verifyPhone(phone, code);
      if (!verified) {
        return ResponseUtils.badRequest(res, 'Invalid or expired verification code');
      }
      ResponseUtils.success(res, { message: 'Phone number verified successfully' });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Phone verification failed');
    }
  }

  async googleAuth(req: Request, res: Response) {
    try {
      const profile: GoogleUserProfile = req.body;
      const user = await this.service.findOrCreateGoogleUser(profile);
      const authResponse = await this.service.generateAuthTokens(user);
      ResponseUtils.success(res, authResponse, 'Google authentication successful');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Google authentication failed');
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const authResponse = await this.service.refreshAuthTokens(refreshToken);
      if (!authResponse) {
        return ResponseUtils.unauthorized(res, 'Invalid refresh token');
      }
      ResponseUtils.success(res, authResponse, 'Token refreshed successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Token refresh failed');
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res, 'User not authenticated');
      }
      const user = await this.service.getUserProfile(userId);
      if (!user) {
        return ResponseUtils.notFound(res, 'User not found');
      }
      ResponseUtils.success(res, user);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch profile');
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res, 'User not authenticated');
      }
      const updateData = req.body;
      const user = await this.service.updateUserProfile(userId, updateData);
      if (!user) {
        return ResponseUtils.notFound(res, 'User not found');
      }
      ResponseUtils.success(res, user, 'Profile updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid') || errorMessage.includes('already exists')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleDatabaseError(res, err);
      }
    }
  }

  async linkGoogle(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res, 'User not authenticated');
      }
      const { googleId } = req.body;
      const success = await this.service.linkGoogleAccount(userId, googleId);
      if (!success) {
        return ResponseUtils.badRequest(res, 'Failed to link Google account');
      }
      ResponseUtils.success(res, { message: 'Google account linked successfully' });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to link Google account');
    }
  }

  // Password Reset Methods
  async getPasswordResetOptions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res, 'User not authenticated');
      }
      const options = await this.passwordResetService.getPasswordResetOptions(userId);
      ResponseUtils.success(res, options);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch password reset options');
    }
  }

  async enableResetMethod(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res, 'User not authenticated');
      }
      const { methodType } = req.body;
      if (!methodType) {
        return ResponseUtils.badRequest(res, 'Method type is required');
      }
      const method = await this.passwordResetService.enableResetMethod(userId, methodType);
      ResponseUtils.success(res, method, 'Password reset method enabled successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to enable password reset method');
    }
  }

  async disableResetMethod(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res, 'User not authenticated');
      }
      const { methodType } = req.body;
      if (!methodType) {
        return ResponseUtils.badRequest(res, 'Method type is required');
      }
      const success = await this.passwordResetService.disableResetMethod(userId, methodType);
      if (!success) {
        return ResponseUtils.notFound(res, 'Password reset method not found');
      }
      ResponseUtils.success(res, { message: 'Password reset method disabled successfully' });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to disable password reset method');
    }
  }

  async setupSecurityQuestions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res, 'User not authenticated');
      }
      const questions: SecurityQuestionSetup[] = req.body.questions;
      if (!questions || questions.length === 0) {
        return ResponseUtils.badRequest(res, 'At least one security question is required');
      }
      const createdQuestions = await this.passwordResetService.setupSecurityQuestions(userId, questions);
      ResponseUtils.success(res, { questions: createdQuestions }, 'Security questions set up successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to set up security questions');
    }
  }

  async generateRecoveryCodes(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res, 'User not authenticated');
      }
      const count = req.body.count || 10;
      if (count < 5 || count > 20) {
        return ResponseUtils.badRequest(res, 'Recovery codes count must be between 5 and 20');
      }
      const codes = await this.passwordResetService.generateRecoveryCodes(userId, count);
      ResponseUtils.success(res, {
        codes,
        message: 'Save these codes in a secure place. Each code can only be used once.'
      });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to generate recovery codes');
    }
  }

  async resetPasswordViaSecurityQuestions(req: Request, res: Response) {
    try {
      const { email, answers, newPassword }: { email: string; answers: { question: string; answer: string }[]; newPassword: string } = req.body;
      if (!email || !answers || answers.length === 0 || !newPassword) {
        return ResponseUtils.badRequest(res, 'Email, answers and new password are required');
      }

      // Find user by email
      const user = await this.service.getUserByEmail(email);
      if (!user) {
        return ResponseUtils.notFound(res, 'User not found');
      }

      // Get user's security questions
      const userQuestions = await this.passwordResetService.getSecurityQuestionsForUser(user.id);
      if (userQuestions.length === 0) {
        return ResponseUtils.badRequest(res, 'No security questions set up for this user');
      }

      // Convert question strings to question IDs
      const answersWithIds = answers.map(answer => {
        const question = userQuestions.find(q => q.question === answer.question);
        if (!question) {
          throw new Error(`Security question not found: ${answer.question}`);
        }
        return {
          questionId: question.id,
          answer: answer.answer
        };
      });

      const success = await this.passwordResetService.resetPasswordViaSecurityQuestions({
        userId: user.id,
        answers: answersWithIds,
        newPassword
      });

      if (!success) {
        return ResponseUtils.badRequest(res, 'Failed to reset password');
      }

      ResponseUtils.success(res, { message: 'Password reset successfully via security questions' });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid') || errorMessage.includes('Incorrect') || errorMessage.includes('not found')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Password reset failed');
      }
    }
  }

  async resetPasswordViaRecoveryCode(req: Request, res: Response) {
    try {
      const { email, recoveryCode, newPassword }: { email: string; recoveryCode: string; newPassword: string } = req.body;
      if (!email || !recoveryCode || !newPassword) {
        return ResponseUtils.badRequest(res, 'Email, recovery code and new password are required');
      }

      // Find user by email
      const user = await this.service.getUserByEmail(email);
      if (!user) {
        return ResponseUtils.notFound(res, 'User not found');
      }

      const success = await this.passwordResetService.resetPasswordViaRecoveryCode({
        userId: user.id,
        recoveryCode,
        newPassword
      });

      if (!success) {
        return ResponseUtils.badRequest(res, 'Failed to reset password');
      }

      ResponseUtils.success(res, { message: 'Password reset successfully via recovery code' });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid') || errorMessage.includes('used')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Password reset failed');
      }
    }
  }

  async adminResetPassword(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;
      const adminRole = (req as any).user?.role;
      if (!adminId || adminRole !== 'admin') {
        return ResponseUtils.forbidden(res, 'Admin access required');
      }
      const { userId, tempPassword, reason } = req.body;
      if (!userId) {
        return ResponseUtils.badRequest(res, 'User ID is required');
      }
      const generatedTempPassword = await this.passwordResetService.adminResetPassword({
        userId,
        tempPassword,
        reason
      });
      ResponseUtils.success(res, {
        tempPassword: generatedTempPassword,
        message: 'Temporary password generated. User should change it immediately after login.'
      });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Admin password reset failed');
    }
  }
}