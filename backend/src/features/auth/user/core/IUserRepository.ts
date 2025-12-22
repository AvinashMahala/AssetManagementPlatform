
import { IBaseRepository } from '@/shared/infrastructure/database/IBaseRepository';
import { User, CreateUserParams, UpdateUserParams } from './user.types';

export interface IUserRepository extends IBaseRepository<User, CreateUserParams, UpdateUserParams> {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmailVerificationToken(token: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;
}
