import { Request, Response } from 'express';
import { GetMetersByProperty } from '../../core/use-cases/GetMetersByProperty.usecase.js';
import { GetMetersByUnit } from '../../core/use-cases/GetMetersByUnit.usecase.js';
import { CreateMeter } from '../../core/use-cases/CreateMeter.usecase.js';
import { UpdateMeter } from '../../core/use-cases/UpdateMeter.usecase.js';
import { DeleteMeter } from '../../core/use-cases/DeleteMeter.usecase.js';
import { ListMeters } from '../../core/use-cases/ListMeters.usecase.js';
import { MeterInput } from '../../core/types/meter.types.js';

export class MeterController {
  constructor(
    private getMetersByProperty: GetMetersByProperty,
    private getMetersByUnit: GetMetersByUnit,
    private createMeter: CreateMeter,
    private updateMeter: UpdateMeter,
    private deleteMeter: DeleteMeter,
    private listMeters: ListMeters
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const meters = await this.listMeters.execute();
      res.json(meters);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch meters' });
    }
  }

  async getByProperty(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const meters = await this.getMetersByProperty.execute(propertyId);
      res.json(meters);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch meters' });
    }
  }

  async getByUnit(req: Request, res: Response): Promise<void> {
    try {
      const { unitId } = req.params;
      const meters = await this.getMetersByUnit.execute(unitId);
      res.json(meters);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch meters' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: MeterInput = req.body;
      const meter = await this.createMeter.execute(data);
      res.status(201).json(meter);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create meter' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: Partial<MeterInput> = req.body;
      const meter = await this.updateMeter.execute(id, data);
      if (!meter) {
        res.status(404).json({ error: 'Meter not found' });
        return;
      }
      res.json(meter);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update meter' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.deleteMeter.execute(id);
      if (!success) {
        res.status(404).json({ error: 'Meter not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete meter' });
    }
  }
}
