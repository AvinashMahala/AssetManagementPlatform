// Database table names and column names
export const TABLES = {
  ASSETS: 'assets',
  USERS: 'users',
} as const;

export const COLUMNS = {
  ASSETS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    VALUE: 'value',
    LOCATION: 'location',
  },
  USERS: {
    ID: 'id',
    USERNAME: 'username',
    EMAIL: 'email',
    PASSWORD: 'password',
    PHONE: 'phone',
    ROLE: 'role',
    IS_EMAIL_VERIFIED: 'is_email_verified',
    IS_PHONE_VERIFIED: 'is_phone_verified',
    EMAIL_VERIFICATION_TOKEN: 'email_verification_token',
    EMAIL_VERIFICATION_EXPIRES: 'email_verification_expires',
    PASSWORD_RESET_TOKEN: 'password_reset_token',
    PASSWORD_RESET_EXPIRES: 'password_reset_expires',
    GOOGLE_ID: 'google_id',
    PROFILE_PICTURE: 'profile_picture',
    LAST_LOGIN: 'last_login',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

// Default values
export const DEFAULTS = {
  USER_ROLE: USER_ROLES.USER,
  PASSWORD_SALT_ROUNDS: 10,
} as const;