import { Request, Response } from 'express';
import { OrganizationConnectionManager } from '@/shared/infrastructure/database/OrganizationConnectionManager';
import { EventBus } from '@/shared/infrastructure/event-bus/EventBus';
import { LeaseRepository } from '../data/LeaseRepository';
import { LeaseService } from '../core/LeaseService';

export class LeaseController {
  private async getService(req: Request): Promise<LeaseService> {
    const orgId = (req.headers['x-organization-id'] as string) || 'default';
    const pool = await OrganizationConnectionManager.getInstance().getConnection(orgId);
    const leaseRepo = new LeaseRepository(pool);
    const eventBus = EventBus.getInstance();
    return new LeaseService(leaseRepo, eventBus);
  }

  create = async (req: Request, res: Response) => {
    try {
      const service = await this.getService(req);
      const lease = await service.createLease(req.body);
      res.status(201).json(lease);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

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
