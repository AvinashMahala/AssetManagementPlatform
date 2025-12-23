import { Request, Response } from 'express';
import { OrganizationConnectionManager } from '@/shared/infrastructure/database/OrganizationConnectionManager';
import { EventBus } from '@/shared/infrastructure/event-bus/EventBus';
import { LeaseRepository } from '../data/LeaseRepository';
import { LeaseService } from '../core/LeaseService';

/**
 * @swagger
 * tags:
 *   name: Leases
 *   description: Lease management endpoints
 */
export class LeaseController {
  private async getService(req: Request): Promise<LeaseService> {
    const orgId = (req.headers['x-organization-id'] as string) || 'default';
    const pool = await OrganizationConnectionManager.getInstance().getConnection(orgId);
    const leaseRepo = new LeaseRepository(pool);
    const eventBus = EventBus.getInstance();
    return new LeaseService(leaseRepo, eventBus);
  }

  /**
   * @swagger
   * /leases:
   *   post:
   *     summary: Create a new lease
   *     tags: [Leases]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - propertyId
   *               - unitId
   *               - tenantId
   *               - startDate
   *               - endDate
   *               - rentAmount
   *             properties:
   *               propertyId:
   *                 type: string
   *               unitId:
   *                 type: string
   *               tenantId:
   *                 type: string
   *               startDate:
   *                 type: string
   *                 format: date
   *               endDate:
   *                 type: string
   *                 format: date
   *               rentAmount:
   *                 type: number
   *               depositAmount:
   *                 type: number
   *     responses:
   *       201:
   *         description: Lease created successfully
   *       500:
   *         description: Internal server error
   */
  create = async (req: Request, res: Response) => {
    try {
      const service = await this.getService(req);
      const lease = await service.createLease(req.body);
      res.status(201).json(lease);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  /**
   * @swagger
   * /leases/{id}:
   *   put:
   *     summary: Update a lease
   *     tags: [Leases]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Lease ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               rentAmount:
   *                 type: number
   *               endDate:
   *                 type: string
   *                 format: date
   *     responses:
   *       200:
   *         description: Lease updated successfully
   *       404:
   *         description: Lease not found
   *       500:
   *         description: Internal server error
   */
  update = async (req: Request, res: Response) => {
    try {
      const service = await this.getService(req);
      const lease = await service.updateLease(req.params.id, req.body);
      if (!lease) {
        return res.status(404).json({ error: 'Lease not found' });
      }
      res.json(lease);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  /**
   * @swagger
   * /leases/{id}/terminate:
   *   post:
   *     summary: Terminate a lease
   *     tags: [Leases]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Lease ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - terminationDate
   *             properties:
   *               terminationDate:
   *                 type: string
   *                 format: date
   *               reason:
   *                 type: string
   *     responses:
   *       200:
   *         description: Lease terminated successfully
   *       404:
   *         description: Lease not found
   *       500:
   *         description: Internal server error
   */
  terminate = async (req: Request, res: Response) => {
    try {
      const service = await this.getService(req);
      const { terminationDate, reason } = req.body;
      const lease = await service.terminateLease(req.params.id, new Date(terminationDate), reason);
      if (!lease) {
        return res.status(404).json({ error: 'Lease not found' });
      }
      res.json(lease);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  /**
   * @swagger
   * /leases/{id}:
   *   get:
   *     summary: Get a lease by ID
   *     tags: [Leases]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Lease ID
   *     responses:
   *       200:
   *         description: Lease details
   *       404:
   *         description: Lease not found
   *       500:
   *         description: Internal server error
   */
  get = async (req: Request, res: Response) => {
    try {
      const service = await this.getService(req);
      const lease = await service.getLease(req.params.id);
      if (!lease) {
        return res.status(404).json({ error: 'Lease not found' });
      }
      res.json(lease);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  /**
   * @swagger
   * /leases:
   *   get:
   *     summary: List leases
   *     tags: [Leases]
   *     parameters:
   *       - in: query
   *         name: propertyId
   *         schema:
   *           type: string
   *         description: Filter by Property ID
   *     responses:
   *       200:
   *         description: List of leases
   *       500:
   *         description: Internal server error
   */
  list = async (req: Request, res: Response) => {
    try {
      const service = await this.getService(req);
      const propertyId = req.query.propertyId as string;
      const leases = await service.listLeases(propertyId);
      res.json(leases);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
