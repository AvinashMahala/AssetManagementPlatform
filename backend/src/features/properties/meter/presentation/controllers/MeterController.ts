import { Request, Response } from 'express';
import { GetMetersByProperty } from '../../core/use-cases/GetMetersByProperty.usecase.js';
import { GetMetersByUnit } from '../../core/use-cases/GetMetersByUnit.usecase.js';
import { CreateMeter } from '../../core/use-cases/CreateMeter.usecase.js';
import { UpdateMeter } from '../../core/use-cases/UpdateMeter.usecase.js';
import { DeleteMeter } from '../../core/use-cases/DeleteMeter.usecase.js';
import { ListMeters } from '../../core/use-cases/ListMeters.usecase.js';
import { MeterInput } from '../../core/types/meter.types.js';

/**
 * @swagger
 * tags:
 *   name: Meters
 *   description: Meter management endpoints
 */
export class MeterController {
  constructor(
    private getMetersByProperty: GetMetersByProperty,
    private getMetersByUnit: GetMetersByUnit,
    private createMeter: CreateMeter,
    private updateMeter: UpdateMeter,
    private deleteMeter: DeleteMeter,
    private listMeters: ListMeters
  ) {}

  /**
   * @swagger
   * /meters:
   *   get:
   *     summary: List all meters
   *     tags: [Meters]
   *     responses:
   *       200:
   *         description: List of meters
   *       500:
   *         description: Internal server error
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const meters = await this.listMeters.execute();
      res.json(meters);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch meters' });
    }
  }

  /**
   * @swagger
   * /meters/property/{propertyId}:
   *   get:
   *     summary: Get meters by Property ID
   *     tags: [Meters]
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     responses:
   *       200:
   *         description: List of meters for the property
   *       500:
   *         description: Internal server error
   */
  async getByProperty(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const meters = await this.getMetersByProperty.execute(propertyId);
      res.json(meters);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch meters' });
    }
  }

  /**
   * @swagger
   * /meters/unit/{unitId}:
   *   get:
   *     summary: Get meters by Unit ID
   *     tags: [Meters]
   *     parameters:
   *       - in: path
   *         name: unitId
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *     responses:
   *       200:
   *         description: List of meters for the unit
   *       500:
   *         description: Internal server error
   */
  async getByUnit(req: Request, res: Response): Promise<void> {
    try {
      const { unitId } = req.params;
      const meters = await this.getMetersByUnit.execute(unitId);
      res.json(meters);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch meters' });
    }
  }

  /**
   * @swagger
   * /meters:
   *   post:
   *     summary: Create a new meter
   *     tags: [Meters]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - propertyId
   *               - type
   *               - serialNumber
   *             properties:
   *               propertyId:
   *                 type: string
   *               unitId:
   *                 type: string
   *               type:
   *                 type: string
   *               serialNumber:
   *                 type: string
   *               location:
   *                 type: string
   *     responses:
   *       201:
   *         description: Meter created successfully
   *       500:
   *         description: Internal server error
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: MeterInput = req.body;
      const meter = await this.createMeter.execute(data);
      res.status(201).json(meter);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create meter' });
    }
  }

  /**
   * @swagger
   * /meters/{id}:
   *   put:
   *     summary: Update a meter
   *     tags: [Meters]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Meter ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               type:
   *                 type: string
   *               serialNumber:
   *                 type: string
   *               location:
   *                 type: string
   *     responses:
   *       200:
   *         description: Meter updated successfully
   *       404:
   *         description: Meter not found
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @swagger
   * /meters/{id}:
   *   delete:
   *     summary: Delete a meter
   *     tags: [Meters]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Meter ID
   *     responses:
   *       204:
   *         description: Meter deleted successfully
   *       404:
   *         description: Meter not found
   *       500:
   *         description: Internal server error
   */
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
