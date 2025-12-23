import { Request, Response } from 'express';
import { IMeterReadingService } from '../../core/interfaces/IMeterReadingService';

/**
 * @swagger
 * tags:
 *   name: MeterReadings
 *   description: Meter reading management endpoints
 */
export class MeterReadingController {
  constructor(private meterReadingService: IMeterReadingService) {}

  /**
   * @swagger
   * /meter-readings:
   *   get:
   *     summary: List all meter readings
   *     tags: [MeterReadings]
   *     responses:
   *       200:
   *         description: List of meter readings
   *       500:
   *         description: Internal server error
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const readings = await this.meterReadingService.getAllMeterReadings();
      res.json(readings);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /meter-readings/{id}:
   *   get:
   *     summary: Get meter reading by ID
   *     tags: [MeterReadings]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Meter Reading ID
   *     responses:
   *       200:
   *         description: Meter reading details
   *       404:
   *         description: Meter reading not found
   *       500:
   *         description: Internal server error
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reading = await this.meterReadingService.getMeterReadingById(id);
      if (!reading) {
        res.status(404).json({ error: 'Meter reading not found' });
        return;
      }
      res.json(reading);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /meter-readings/meter/{meterId}:
   *   get:
   *     summary: Get meter readings by Meter ID
   *     tags: [MeterReadings]
   *     parameters:
   *       - in: path
   *         name: meterId
   *         required: true
   *         schema:
   *           type: string
   *         description: Meter ID
   *     responses:
   *       200:
   *         description: List of meter readings for the meter
   *       500:
   *         description: Internal server error
   */
  async getByMeter(req: Request, res: Response): Promise<void> {
    try {
      const { meterId } = req.params;
      const readings = await this.meterReadingService.getMeterReadingsByMeter(meterId);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /meter-readings:
   *   post:
   *     summary: Create a new meter reading
   *     tags: [MeterReadings]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - meterId
   *               - readingValue
   *               - readingDate
   *             properties:
   *               meterId:
   *                 type: string
   *               readingValue:
   *                 type: number
   *               readingDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Meter reading created successfully
   *       400:
   *         description: Invalid input
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const readingData = req.body;
      // Ensure readingDate is a Date object
      if (readingData.readingDate) {
        readingData.readingDate = new Date(readingData.readingDate);
      }
      const reading = await this.meterReadingService.createMeterReading(readingData);
      res.status(201).json(reading);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /meter-readings/{id}:
   *   put:
   *     summary: Update a meter reading
   *     tags: [MeterReadings]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Meter Reading ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               readingValue:
   *                 type: number
   *               readingDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       200:
   *         description: Meter reading updated successfully
   *       404:
   *         description: Meter reading not found
   *       400:
   *         description: Invalid input
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const readingData = req.body;
      const reading = await this.meterReadingService.updateMeterReading(id, readingData);
      if (!reading) {
        res.status(404).json({ error: 'Meter reading not found' });
        return;
      }
      res.json(reading);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /meter-readings/{id}:
   *   delete:
   *     summary: Delete a meter reading
   *     tags: [MeterReadings]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Meter Reading ID
   *     responses:
   *       204:
   *         description: Meter reading deleted successfully
   *       404:
   *         description: Meter reading not found
   *       500:
   *         description: Internal server error
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.meterReadingService.deleteMeterReading(id);
      if (!success) {
        res.status(404).json({ error: 'Meter reading not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
