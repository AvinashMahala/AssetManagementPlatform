// User-related type definitions
export interface User {
  id: number;
  username: string;
  email: string;
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

export interface AuthUser {
  user: User;
  token: string;
}

export interface UserProfile extends User {
  // Additional profile fields can be added here
  lastLogin?: string;
  isActive: boolean;
}