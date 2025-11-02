import {
  User,
  UserInput,
  UserCredentials,
  UserRegistrationInput,
  GoogleUserProfile,
  EmailVerificationRequest,
  EmailVerificationConfirm,
  PhoneVerificationRequest,
  PhoneVerificationConfirm,
  AuthResponse
} from '../../models/User';

export interface IUserService {
  // Basic CRUD operations
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: UserInput): Promise<User>;
  updateUser(id: string, userData: Partial<UserInput>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;

  // Authentication methods
  authenticateUser(credentials: UserCredentials): Promise<User | null>;
  registerUser(userData: UserRegistrationInput): Promise<User>;
  loginUser(credentials: UserCredentials): Promise<AuthResponse | null>;
  logoutUser(userId: string): Promise<boolean>;

  // Email authentication
  requestEmailVerification(userId: string): Promise<string>;
  verifyEmail(token: string): Promise<boolean>;
  resendEmailVerification(email: string): Promise<boolean>;

  // Phone authentication
  requestPhoneVerification(phone: string): Promise<string>;
  verifyPhone(phone: string, code: string): Promise<boolean>;

  // Google OAuth
  findOrCreateGoogleUser(profile: GoogleUserProfile): Promise<User>;
  linkGoogleAccount(userId: string, googleId: string): Promise<boolean>;

  // Token management
  generateAuthTokens(user: User): Promise<AuthResponse>;
  refreshAuthTokens(refreshToken: string): Promise<AuthResponse | null>;
  validateRefreshToken(token: string): Promise<User | null>;

  // User profile
  getUserProfile(userId: string): Promise<User | null>;
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User | null>;
  updateLastLogin(userId: string): Promise<boolean>;
}