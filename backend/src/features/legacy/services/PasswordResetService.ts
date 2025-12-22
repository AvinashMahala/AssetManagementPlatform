import { PasswordResetMethodRepository } from '@/features/legacy/repositories/PasswordResetMethodRepository.js';
import { SecurityQuestionRepository } from '@/features/legacy/repositories/SecurityQuestionRepository.js';
import { RecoveryCodeRepository } from '@/features/legacy/repositories/RecoveryCodeRepository.js';
import { IUserRepository } from '@/interfaces/repositories/IUserRepository.js';
import {
  PasswordResetMethod,
  SecurityQuestion,
  RecoveryCode,
  PasswordResetViaSecurityQuestions,
  PasswordResetViaRecoveryCode,
  AdminPasswordReset,
  PasswordResetOptions,
  SecurityQuestionSetup
} from '@/models/User.js';
import { PasswordUtils } from '@/shared/utils/password.js';

export class PasswordResetService {
  private passwordResetMethodRepo: PasswordResetMethodRepository;
  private securityQuestionRepo: SecurityQuestionRepository;
  private recoveryCodeRepo: RecoveryCodeRepository;
  private userRepo: IUserRepository;

  constructor(
    passwordResetMethodRepo: PasswordResetMethodRepository,
    securityQuestionRepo: SecurityQuestionRepository,
    recoveryCodeRepo: RecoveryCodeRepository,
    userRepo: IUserRepository
  ) {
    this.passwordResetMethodRepo = passwordResetMethodRepo;
    this.securityQuestionRepo = securityQuestionRepo;
    this.recoveryCodeRepo = recoveryCodeRepo;
    this.userRepo = userRepo;
  }

  // Get available reset methods for a user
  async getPasswordResetOptions(userId: string): Promise<PasswordResetOptions> {
    const methods = await this.passwordResetMethodRepo.findByUserId(userId);

    let securityQuestions: SecurityQuestion[] | undefined;
    let recoveryCodesCount: number | undefined;

    if (methods.some(m => m.methodType === 'security_questions' && m.isEnabled)) {
      securityQuestions = await this.securityQuestionRepo.findByUserId(userId);
    }

    if (methods.some(m => m.methodType === 'recovery_codes' && m.isEnabled)) {
      const codes = await this.recoveryCodeRepo.findUnusedByUserId(userId);
      recoveryCodesCount = codes.length;
    }

    return {
      availableMethods: methods,
      securityQuestions,
      recoveryCodesCount
    };
  }

  // Get security questions for a user (public method for password reset)
  async getSecurityQuestionsForUser(userId: string): Promise<SecurityQuestion[]> {
    return await this.securityQuestionRepo.findByUserId(userId);
  }

  // Enable a password reset method for a user
  async enableResetMethod(userId: string, methodType: string): Promise<PasswordResetMethod> {
    // Check if method already exists
    const existingMethods = await this.passwordResetMethodRepo.findByUserId(userId);
    const existingMethod = existingMethods.find(m => m.methodType === methodType);

    if (existingMethod) {
      await this.passwordResetMethodRepo.enableMethod(userId, methodType);
      return { ...existingMethod, isEnabled: true };
    } else {
      return await this.passwordResetMethodRepo.create(userId, methodType);
    }
  }

  // Disable a password reset method for a user
  async disableResetMethod(userId: string, methodType: string): Promise<boolean> {
    return await this.passwordResetMethodRepo.disableMethod(userId, methodType);
  }

  // Security Questions Methods
  async setupSecurityQuestions(userId: string, questions: SecurityQuestionSetup[]): Promise<SecurityQuestion[]> {
    // Delete existing questions
    await this.securityQuestionRepo.deleteByUserId(userId);

    // Create new questions
    const createdQuestions: SecurityQuestion[] = [];
    for (const q of questions) {
      const answerHash = await PasswordUtils.hashPassword(q.answer);
      const question = await this.securityQuestionRepo.create(userId, q.question, answerHash);
      createdQuestions.push(question);
    }

    // Enable security questions method
    await this.enableResetMethod(userId, 'security_questions');

    return createdQuestions;
  }

  async resetPasswordViaSecurityQuestions(data: PasswordResetViaSecurityQuestions): Promise<boolean> {
    const { userId, answers, newPassword } = data;

    // Get user's security questions
    const userQuestions = await this.securityQuestionRepo.findByUserId(userId);
    if (userQuestions.length === 0) {
      throw new Error('No security questions set up for this user');
    }

    // Verify all answers
    for (const answer of answers) {
      const question = userQuestions.find(q => q.id === answer.questionId);
      if (!question) {
        throw new Error('Invalid security question');
      }

      const isValid = await PasswordUtils.verifyPassword(answer.answer, question.answerHash);
      if (!isValid) {
        throw new Error('Incorrect answer to security question');
      }
    }

    // All answers correct, reset password
    const hashedPassword = await PasswordUtils.hashPassword(newPassword);
    return await this.userRepo.updatePassword(userId, hashedPassword);
  }

  // Recovery Codes Methods
  async generateRecoveryCodes(userId: string, count: number = 10): Promise<string[]> {
    // Delete existing codes
    await this.recoveryCodeRepo.deleteByUserId(userId);

    // Generate new codes
    const codes: string[] = [];
    const codeHashes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = this.generateRecoveryCode();
      codes.push(code);
      const hash = await PasswordUtils.hashPassword(code);
      codeHashes.push(hash);
    }

    // Save hashed codes
    await this.recoveryCodeRepo.createMultiple(userId, codeHashes);

    // Enable recovery codes method
    await this.enableResetMethod(userId, 'recovery_codes');

    return codes;
  }

  async resetPasswordViaRecoveryCode(data: PasswordResetViaRecoveryCode): Promise<boolean> {
    const { userId, recoveryCode, newPassword } = data;

    // Find the recovery code
    const codeHash = await PasswordUtils.hashPassword(recoveryCode);
    const codeRecord = await this.recoveryCodeRepo.findByCodeHash(codeHash);

    if (!codeRecord || codeRecord.userId !== userId || codeRecord.used) {
      throw new Error('Invalid or used recovery code');
    }

    // Mark code as used
    await this.recoveryCodeRepo.markAsUsed(codeRecord.id);

    // Reset password
    const hashedPassword = await PasswordUtils.hashPassword(newPassword);
    return await this.userRepo.updatePassword(userId, hashedPassword);
  }

  // Admin Methods
  async adminResetPassword(data: AdminPasswordReset): Promise<string> {
    const { userId, tempPassword } = data;

    // Generate a temporary password if not provided
    const tempPass = tempPassword || this.generateTempPassword();

    // Hash and set the temporary password
    const hashedPassword = await PasswordUtils.hashPassword(tempPass);
    const success = await this.userRepo.updatePassword(userId, hashedPassword);

    if (!success) {
      throw new Error('Failed to reset user password');
    }

    // Enable admin assist method for future reference
    await this.enableResetMethod(userId, 'admin_assist');

    return tempPass;
  }

  // Helper methods
  private generateRecoveryCode(): string {
    // Generate a 10-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateTempPassword(): string {
    // Generate a secure temporary password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}