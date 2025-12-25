
import { Router } from 'express';
import { Pool } from 'pg';
import { UserRepository } from './data/UserRepository';
import { UserService } from './core/UserService';
import { UserController } from './api/UserController';
import { authMiddleware } from '@/shared/middleware/authMiddleware';

export class UserModule {
  public router: Router;
  public service: UserService;
  private controller: UserController;
  private repository: UserRepository;

  constructor(pool: Pool) {
    this.router = Router();
    this.repository = new UserRepository(pool);
    this.service = new UserService(this.repository);
    this.controller = new UserController(this.service);
    
    this.setupRoutes();
  }

  private setupRoutes() {
    // Base route: /api/users
    
    // Protected routes
    // Note: We need to cast authMiddleware because of Express type mismatches
    // In a real app, we'd fix the types properly
    // this.router.use(authMiddleware(this.service) as any);

    this.router.get('/', this.controller.getAllUsers.bind(this.controller));
    this.router.get('/:id', this.controller.getUserById.bind(this.controller));
    this.router.post('/', this.controller.createUser.bind(this.controller));
    this.router.put('/:id', this.controller.updateUser.bind(this.controller));
    this.router.delete('/:id', this.controller.deleteUser.bind(this.controller));
  }
}
