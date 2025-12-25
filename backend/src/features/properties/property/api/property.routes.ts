import { Router, RequestHandler } from 'express';
import { defaultMemoryUploader } from '@/shared/utils/uploads';
import { PropertyController } from './PropertyController.js';
import { conditionalAuth } from '@/shared/middleware/authMiddleware.js';
import { IPropertyFileController, IReceiptTemplateController, UserServiceLike } from '../types';
import { createPropertyFilesRouter } from './property.files.routes';
import { createPropertyTemplatesRouter } from './property.templates.routes';
import { validateZodRequest } from '@/shared/middleware/validationMiddleware';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { createPropertySchema, updatePropertySchema, updatePropertyStatusSchema, setPropertyTemplateSchema, getPropertySchema } from './property.validation';

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

  // Core property CRUD routes
  /** 001. Get all properties, optionally filtered by ownerId.
   * Retrieve a list of all properties.
   * @route GET /properties
   * @returns A list of properties or an error response.
   */
  router.get('/', auth, asyncHandler(controller.getAll.bind(controller)));

  /** 002. Get a single property by ID.
   * Retrieve a single property by its ID.
   * @route GET /properties/:id
   * @returns A single property or an error response.
   */
  router.get('/:id', auth, validateZodRequest(getPropertySchema), asyncHandler(controller.getById.bind(controller)));

  /** 003. Create a new property.
   * Create a new property with the provided data.
   * @route POST /properties
   * @returns The created property or an error response.
   */
  router.post('/', auth, validateZodRequest(createPropertySchema), asyncHandler(controller.create.bind(controller)));

  /** 004. Update an existing property by ID.
   * Update a property with the provided data.
   * @route PUT /properties/:id
   * @returns The updated property or an error response.
   */
  router.put('/:id', auth, validateZodRequest(updatePropertySchema), asyncHandler(controller.update.bind(controller)));

  /** 005. Delete a property by ID.
   * Delete a property by its ID.
   * @route DELETE /properties/:id
   * @returns A success message or an error response.
   */
  router.delete('/:id', auth, asyncHandler(controller.delete.bind(controller)));

  // Status and template management
  /** 006. Update the status of a property.
   * Update the status of a property (e.g., active, inactive).
   * @route PATCH /properties/:id/status
   * @returns The updated property or an error response.
   */
  router.patch('/:id/status', auth, validateZodRequest(updatePropertyStatusSchema), asyncHandler(controller.updateStatus.bind(controller)));

  // Property template management

  /** 007. Set or update Property template
   * @route PUT /properties/:id/template
   * @returns The updated property after setting the template or an error response.
   */
  router.put('/:id/template', auth, validateZodRequest(setPropertyTemplateSchema), asyncHandler(controller.setPropertyTemplate.bind(controller)));

  /** 008. Get Property template details
   * @route GET /properties/:id/template
   * @returns The property template details or an error response.
   */
  router.get('/:id/template', auth, validateZodRequest(getPropertySchema), asyncHandler(controller.getPropertyTemplate.bind(controller)));

  /** 009. Remove Property template
   * @route DELETE /properties/:id/template
   * @returns A success message or an error response.
   */
  router.delete('/:id/template', auth, asyncHandler(controller.removePropertyTemplate.bind(controller)));



  /** 000. Property File Upload Configuration
   * 
   */
  const propertyFileUpload = defaultMemoryUploader;

  /** 001. Property File-related routes (optional). The `fileController` is injected
   * so the property module doesn't own file concerns and remains testable.
   */
  if (fileController) {
    // Mount file-related sub-router at '/:propertyId/files'
    router.use('/:propertyId/files', createPropertyFilesRouter(fileController, auth, propertyFileUpload));
  }

  /** 002. Receipt Template-related routes (optional). The `receiptTemplateController` is injected
   * so the property module doesn't own receipt template concerns and remains testable.
   */
  if (receiptTemplateController) {
    router.use('/:propertyId/receipt-template', createPropertyTemplatesRouter(receiptTemplateController, auth));
  }

  return router;
};
