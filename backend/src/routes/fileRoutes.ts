import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/FileController.js';
import { FileStorageService } from '../services/FileStorageService.js';
import { Pool } from 'pg';

const createFileRoutes = (mainPool: Pool, filesPool: Pool) => {
  const router = Router();

  // Initialize file storage service
  const fileStorageService = new FileStorageService(mainPool, filesPool);
  const fileController = new FileController(fileStorageService);

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

  /**
   * @swagger
   * /api/files/upload:
   *   post:
   *     summary: Upload a file
   *     tags: [Files]
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: File to upload
   *               entityType:
   *                 type: string
   *                 description: Type of entity (property, unit, tenant)
   *               entityId:
   *                 type: string
   *                 description: ID of the entity
   *               category:
   *                 type: string
   *                 description: File category (photo, document, etc.)
   *               tags:
   *                 type: string
   *                 description: Comma-separated tags
   *     responses:
   *       200:
   *         description: File uploaded successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Server error
   */
  router.post('/upload', upload.single('file'), fileController.uploadFile.bind(fileController));

  /**
   * @swagger
   * /api/files/{fileId}/download:
   *   get:
   *     summary: Download a file
   *     tags: [Files]
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File downloaded successfully
   *       404:
   *         description: File not found
   *       500:
   *         description: Server error
   */
  router.get('/:fileId/download', fileController.downloadFile.bind(fileController));

  /**
   * @swagger
   * /api/files/{fileId}/metadata:
   *   get:
   *     summary: Get file metadata
   *     tags: [Files]
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File metadata retrieved successfully
   *       404:
   *         description: File not found
   *       500:
   *         description: Server error
   */
  router.get('/:fileId/metadata', fileController.getFileMetadata.bind(fileController));

  /**
   * @swagger
   * /api/files/entity/{entityType}/{entityId}:
   *   get:
   *     summary: List files for an entity
   *     tags: [Files]
   *     parameters:
   *       - in: path
   *         name: entityType
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: entityId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Files listed successfully
   *       500:
   *         description: Server error
   */
  router.get('/entity/:entityType/:entityId', fileController.listEntityFiles.bind(fileController));

  /**
   * @swagger
   * /api/files/{fileId}:
   *   delete:
   *     summary: Delete a file
   *     tags: [Files]
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File deleted successfully
   *       404:
   *         description: File not found
   *       500:
   *         description: Server error
   */
  router.delete('/:fileId', fileController.deleteFile.bind(fileController));

  /**
   * @swagger
   * /api/files/stats:
   *   get:
   *     summary: Get storage statistics
   *     tags: [Files]
   *     responses:
   *       200:
   *         description: Storage statistics retrieved successfully
   *       500:
   *         description: Server error
   */
  router.get('/stats', fileController.getStorageStats.bind(fileController));

  /**
   * @swagger
   * /api/files:
   *   get:
   *     summary: List all files with optional filters
   *     tags: [Files]
   *     parameters:
   *       - in: query
   *         name: entityType
   *         schema:
   *           type: string
   *         description: Filter by entity type (property, unit, tenant)
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in filename
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Number of files to return
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Number of files to skip
   *     responses:
   *       200:
   *         description: Files listed successfully
   *       500:
   *         description: Server error
   */
  router.get('/', fileController.listAllFiles.bind(fileController));

  return router;
};

export { createFileRoutes };