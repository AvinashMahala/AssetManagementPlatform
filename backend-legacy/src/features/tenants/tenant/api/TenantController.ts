import { Request, Response, NextFunction } from 'express';
import { ITenantService } from '../core/interfaces/ITenantService';
import { createTenantSchema, updateTenantSchema } from './tenant.schema.validator';

import { logger } from '@/shared/utils/logger';

/** TenantController
 *
 * Handles HTTP requests related to tenants and delegates to use-cases.
 * Each method validates input where applicable and returns appropriate
 * HTTP responses (status codes and payloads) or forwards errors to
 * the next middleware.
 */
export class TenantController {
  constructor(private readonly tenantService: ITenantService) {}

  /** 001. Create a new tenant
   *
   * Route: POST /
   * Body: validated against `createTenantSchema`
   * Auth: required (handled by route middleware)
   * Success: 201 with created tenant object
   * Errors: validation errors or use-case errors forwarded to `next`
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createTenantSchema.parse(req.body);
      const tenant = await this.tenantService.createTenant(validatedData as any);
      res.status(201).json(tenant);
    } catch (error) {
      next(error);
    }
  };

  /** 002. List tenants
   *
   * Route: GET /
   * Query: optional filters/pagination provided by the client (not validated here)
   * Auth: required
   * Success: 200 with an array of tenants
   * Notes: Logs basic metrics about returned count
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('TenantController.list: Fetching all tenants');
      const tenants = await this.tenantService.getAllTenants();
      logger.info(`TenantController.list: Found ${tenants.length} tenants`);
      res.json(tenants);
    } catch (error) {
      logger.error('TenantController.list: Error fetching tenants', { error });
      next(error);
    }
  };

  /** 003. Get a tenant by id
   *
   * Route: GET /:id
   * Params: `id` - tenant identifier (from `req.params`)
   * Auth: required
   * Success: 200 with tenant object, or propagate 404 from use-case
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenant = await this.tenantService.getTenantById(id);
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  };

  /** 004. Update a tenant
   *
   * Route: PUT /:id
   * Params: `id` - tenant identifier
   * Body: validated against `updateTenantSchema`
   * Auth: required
   * Success: 200 with updated tenant
   * Errors: validation errors or use-case errors forwarded to `next`
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = updateTenantSchema.parse(req.body);
      const tenant = await this.tenantService.updateTenant(id, validatedData as any);
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  };

  /** 005. Delete a tenant
   *
   * Route: DELETE /:id
   * Params: `id` - tenant identifier
   * Auth: required
   * Success: 204 on successful deletion
   * Errors: use-case errors forwarded to `next`
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await this.tenantService.deleteTenant(id);
      if (!deleted) {
        // Let the service determine behavior; mimic previous behavior by throwing
        throw new Error(`Tenant with id ${id} not found`);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
