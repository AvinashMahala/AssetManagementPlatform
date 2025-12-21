import { Router } from 'express';
import multer from 'multer';
import { PropertyController } from '../controllers/propertyController';
import { PropertyFileController } from '../controllers/PropertyFileController';
import { PropertyReceiptTemplateController } from '../controllers/PropertyReceiptTemplateController';
import { conditionalAuth, AuthenticatedRequest } from '@/shared/middleware/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createPropertyRoutes = (
  controller: PropertyController,
  fileController: PropertyFileController,
  receiptTemplateController: PropertyReceiptTemplateController,
  userService: IUserService
) => {
  const router = Router();

  // Apply conditional auth to all property routes
  const auth = conditionalAuth(userService);

  // Configure multer for property file uploads
  const propertyFileUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
      // Allow common file types for properties
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`));
      }
    }
  });

  router.get('/', auth, controller.getAll.bind(controller));
  router.get('/:id', auth, controller.getById.bind(controller));
  router.post('/', auth, controller.create.bind(controller));
  router.put('/:id', auth, controller.update.bind(controller));
  router.delete('/:id', auth, controller.delete.bind(controller));
  router.patch('/:id/status', auth, controller.updateStatus.bind(controller));

  // Template management routes
  router.get('/:id/template', auth, controller.getPropertyTemplate.bind(controller));
  router.put('/:id/template', auth, controller.setPropertyTemplate.bind(controller));
  router.delete('/:id/template', auth, controller.removePropertyTemplate.bind(controller));

  // File management routes
  router.post('/:propertyId/files', auth, propertyFileUpload.single('file') as any, fileController.uploadFile.bind(fileController) as any);
  router.get('/:propertyId/files', auth, fileController.getPropertyFiles.bind(fileController));
  router.get('/:propertyId/files/:fileId/download', auth, fileController.downloadFile.bind(fileController));
  router.put('/files/:fileId', auth, fileController.updateFile.bind(fileController));
  router.delete('/:propertyId/files/:fileId', auth, fileController.deleteFile.bind(fileController));

  // Receipt template routes
  router.post('/:propertyId/receipt-template', auth, receiptTemplateController.createTemplate.bind(receiptTemplateController));
  router.get('/:propertyId/receipt-template', auth, receiptTemplateController.getTemplate.bind(receiptTemplateController));
  router.put('/:propertyId/receipt-template', auth, receiptTemplateController.updateTemplate.bind(receiptTemplateController));
  router.delete('/:propertyId/receipt-template', auth, receiptTemplateController.deleteTemplate.bind(receiptTemplateController));
  router.get('/:propertyId/upi-links', auth, receiptTemplateController.generateUPILinks.bind(receiptTemplateController));

  return router;
};