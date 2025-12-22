import { Request, Response } from 'express';
import { IMeterReadingService } from '../../core/interfaces/IMeterReadingService';

export class MeterReadingController {
  constructor(private meterReadingService: IMeterReadingService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const readings = await this.meterReadingService.getAllMeterReadings();
      res.json(readings);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

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

  async getByMeter(req: Request, res: Response): Promise<void> {
    try {
      const { meterId } = req.params;
      const readings = await this.meterReadingService.getMeterReadingsByMeter(meterId);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

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
