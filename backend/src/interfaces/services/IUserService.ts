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
  getUserById(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: UserInput): Promise<User>;
  updateUser(id: number, userData: Partial<UserInput>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;

  // Authentication methods
  authenticateUser(credentials: UserCredentials): Promise<User | null>;
  registerUser(userData: UserRegistrationInput): Promise<User>;
  loginUser(credentials: UserCredentials): Promise<AuthResponse | null>;
  logoutUser(userId: number): Promise<boolean>;

  // Email authentication
  requestEmailVerification(userId: number): Promise<string>;
  verifyEmail(token: string): Promise<boolean>;
  resendEmailVerification(email: string): Promise<boolean>;

  // Phone authentication
  requestPhoneVerification(phone: string): Promise<string>;
  verifyPhone(phone: string, code: string): Promise<boolean>;

  // Google OAuth
  findOrCreateGoogleUser(profile: GoogleUserProfile): Promise<User>;
  linkGoogleAccount(userId: number, googleId: string): Promise<boolean>;

  // Token management
  generateAuthTokens(user: User): Promise<AuthResponse>;
  refreshAuthTokens(refreshToken: string): Promise<AuthResponse | null>;
  validateRefreshToken(token: string): Promise<User | null>;

  // User profile
  getUserProfile(userId: number): Promise<User | null>;
  updateUserProfile(userId: number, profileData: Partial<User>): Promise<User | null>;
  updateLastLogin(userId: number): Promise<boolean>;
}