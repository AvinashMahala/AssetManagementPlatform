
export interface User {
  id: string;
  username: string;
  name?: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'admin' | 'user';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  googleId?: string;
  profilePicture?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserParams {
  username: string;
  email: string;
  password?: string;
  phone?: string;
  role?: 'admin' | 'user';
  name?: string;
  googleId?: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface UpdateUserParams {
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: 'admin' | 'user';
  name?: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  updatedAt?: Date;
}

export interface UserFilters {
  role?: 'admin' | 'user';
  email?: string;
  username?: string;
}
