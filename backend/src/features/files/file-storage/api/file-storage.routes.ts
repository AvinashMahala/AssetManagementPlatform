import { Router } from 'express';
import multer from 'multer';
import { FileStorageController } from './FileStorageController';

export const createFileStorageRoutes = (controller: FileStorageController, authMiddleware: any) => {
  const router = Router();

  // Configure multer for memory storage
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
      // Allow common file types
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'text/markdown'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`));
      }
    }
  });

  router.post('/upload', authMiddleware as any, upload.single('file') as any, controller.uploadFile);
  // List files (paginated)
  router.get('/', authMiddleware as any, controller.listFiles as any);
  // File metadata
  router.get('/:fileId/metadata', controller.getMetadata as any);
  router.get('/:fileId/download', controller.downloadFile); // Auth handled in controller/service or optional
  // Delete a file
  router.delete('/:fileId', authMiddleware as any, controller.deleteFile as any);

  return router;
};
