// User-related type definitions
export interface User {
  id: string;
  username: string;
  name?: string; // Full display name (for Google OAuth users)
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profilePicture?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface UserCredentials extends UserLoginInput {}

export interface AuthUser {
  user: User;
  token: string;
}

export interface UserProfile extends User {
  // Additional profile fields can be added here
  lastLogin?: string;
  isActive: boolean;
}