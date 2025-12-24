import { Router, RequestHandler } from 'express';
import { defaultMemoryUploader } from '@/shared/utils/uploads';
import { PropertyController } from './PropertyController.js';
import { conditionalAuth } from '@/shared/middleware/authMiddleware.js';
import { IPropertyFileController, IReceiptTemplateController, UserServiceLike } from '../types';
import { createPropertyFilesRouter } from './property.files.routes';
import { createPropertyTemplatesRouter } from './property.templates.routes';
import { validateZodRequest } from '@/shared/middleware/validationMiddleware';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { createPropertySchema, updatePropertySchema, updatePropertyStatusSchema, setPropertyTemplateSchema } from './property.validation';

/**
 * Property routes factory
 *
 * This module exports a factory function `createPropertyRoutes` that wires
 * up Express routes for all operations related to properties (CRUD, files,
 * templates, UPI links, and status changes).
 *
 * Notes:
 * - Authentication is added conditionally via `conditionalAuth(userService)`
 *   so routes can be used in contexts where auth should be toggled (e.g., tests)
 * - File upload handling uses `multer` with memory storage and a 50MB limit
 * - Request validation is performed with Zod via `validateZodRequest`
 */

export const createPropertyRoutes = (
  controller: PropertyController,
  userService: UserServiceLike,
  fileController?: IPropertyFileController,
  receiptTemplateController?: IReceiptTemplateController
) => {
  const router = Router();
  // `conditionalAuth` returns an express middleware (RequestHandler)
  const auth: RequestHandler = conditionalAuth(userService);

  // Use centralized memory uploader (50MB default). This is shared across
  // file-related routes in the app.
  const propertyFileUpload = defaultMemoryUploader;

  // Core property CRUD routes
  router.get('/', auth, asyncHandler(controller.getAll.bind(controller)));
  router.get('/:id', auth, asyncHandler(controller.getById.bind(controller)));
  router.post('/', auth, validateZodRequest(createPropertySchema), asyncHandler(controller.create.bind(controller)));
  router.put('/:id', auth, validateZodRequest(updatePropertySchema), asyncHandler(controller.update.bind(controller)));
  router.delete('/:id', auth, asyncHandler(controller.delete.bind(controller)));

  // Status and template management
  router.patch('/:id/status', auth, validateZodRequest(updatePropertyStatusSchema), asyncHandler(controller.updateStatus.bind(controller)));
  router.get('/:id/template', auth, asyncHandler(controller.getPropertyTemplate.bind(controller)));
  router.put('/:id/template', auth, validateZodRequest(setPropertyTemplateSchema), asyncHandler(controller.setPropertyTemplate.bind(controller)));
  router.delete('/:id/template', auth, asyncHandler(controller.removePropertyTemplate.bind(controller)));

  // File-related routes (optional). The `fileController` is injected so the
  // property module doesn't own file storage concerns and remains testable.
  if (fileController) {
    // Mount file-related sub-router at '/:propertyId/files'
    router.use('/:propertyId/files', createPropertyFilesRouter(fileController, auth, propertyFileUpload));
  }

  // Receipt template routes (optional injection)
  if (receiptTemplateController) {
    router.use('/:propertyId/receipt-template', createPropertyTemplatesRouter(receiptTemplateController, auth));
  }

  return router;
};
