import { Pool } from 'pg';
import { FileStorageRepository } from './data/FileStorageRepository';
import { FileStorageService } from './core/services/FileStorageService';
import { FileStorageController } from './api/FileStorageController';
import { createFileStorageRoutes } from './api/file-storage.routes';

export class FileStorageModule {
  public readonly repository: FileStorageRepository;
  public readonly service: FileStorageService;
  public readonly controller: FileStorageController;
  public readonly router: any;

  constructor(filesPool: Pool, authMiddleware: any) {
    this.repository = new FileStorageRepository(filesPool);
    this.service = new FileStorageService(this.repository);
    this.controller = new FileStorageController(this.service);
    this.router = createFileStorageRoutes(this.controller, authMiddleware);
  }
}
