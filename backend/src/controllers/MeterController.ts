import { Request, Response } from 'express';
import { IMeterService, IMeterReadingService } from '../interfaces/services/IMeterService.js';
import { MeterInput, MeterReadingInput } from '../models/Meter.js';
import { ResponseUtils } from '../utils/response.js';
import { ErrorUtils } from '../utils/error.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('MeterController');

export class MeterController {
  private meterService: IMeterService;
  private meterReadingService: IMeterReadingService;

  constructor(meterService: IMeterService, meterReadingService: IMeterReadingService) {
    this.meterService = meterService;
    this.meterReadingService = meterReadingService;
  }

  // ===== METER ENDPOINTS =====

  /**
   * @swagger
   * /api/meters:
   *   get:
   *     tags: ['Meters']
   *     summary: Get all meters
   *     parameters:
   *       - in: query
   *         name: unitId
   *         schema:
   *           type: string
   *         description: Filter meters by unit ID
   *       - in: query
   *         name: propertyId
   *         schema:
   *           type: string
   *         description: Filter meters by property ID
   *     responses:
   *       200:
   *         description: List of meters
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 meters:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Meter'
   */
  async getAllMeters(req: Request, res: Response) {
    try {
      const { unitId, propertyId } = req.query;
      logger.debug('Fetching meters', { unitId, propertyId });

      let meters;
      if (unitId) {
        meters = await this.meterService.getMetersByUnit(unitId as string);
      } else if (propertyId) {
        meters = await this.meterService.getMetersByProperty(propertyId as string);
      } else {
        meters = await this.meterService.getAllMeters();
      }

      logger.info('Successfully fetched meters', { count: meters.length, unitId, propertyId });
      ResponseUtils.success(res, meters);
    } catch (err) {
      logger.error('Failed to fetch meters', err, { unitId: req.query.unitId, propertyId: req.query.propertyId });
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch meters');
    }
  }

  /**
   * @swagger
   * /api/meters/{id}:
   *   get:
   *     tags: ['Meters']
   *     summary: Get meter by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Meter details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Meter'
   *       404:
   *         description: Meter not found
   */
  async getMeterById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const meter = await this.meterService.getMeterById(id);

      if (!meter) {
        return ResponseUtils.notFound(res, 'Meter not found');
      }

      ResponseUtils.success(res, meter);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch meter');
    }
  }

  /**
   * @swagger
   * /api/meters:
   *   post:
   *     tags: ['Meters']
   *     summary: Create a new meter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MeterInput'
   *     responses:
   *       201:
   *         description: Meter created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Meter'
   */
  async createMeter(req: Request, res: Response) {
    try {
      const meterData: MeterInput = req.body;
      const meter = await this.meterService.createMeter(meterData);
      ResponseUtils.created(res, meter, 'Meter created successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to create meter');
      }
    }
  }

  /**
   * @swagger
   * /api/meters/{id}:
   *   put:
   *     tags: ['Meters']
   *     summary: Update meter
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MeterInput'
   *     responses:
   *       200:
   *         description: Meter updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Meter'
   *       404:
   *         description: Meter not found
   */
  async updateMeter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const meterData: Partial<MeterInput> = req.body;

      const meter = await this.meterService.updateMeter(id, meterData);
      if (!meter) {
        return ResponseUtils.notFound(res, 'Meter not found');
      }

      ResponseUtils.success(res, meter, 'Meter updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update meter');
      }
    }
  }

  /**
   * @swagger
   * /api/meters/{id}:
   *   delete:
   *     tags: ['Meters']
   *     summary: Delete meter
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Meter deleted
   *       404:
   *         description: Meter not found
   */
  async deleteMeter(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleted = await this.meterService.deleteMeter(id);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'Meter not found');
      }

      ResponseUtils.success(res, null, 'Meter deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete meter');
    }
  }

  /**
   * @swagger
   * /api/meters/{id}/status:
   *   patch:
   *     tags: ['Meters']
   *     summary: Update meter status
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Meter status updated
   *       404:
   *         description: Meter not found
   */
  async updateMeterStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return ResponseUtils.badRequest(res, 'isActive is required');
      }

      const updated = await this.meterService.updateMeterStatus(id, isActive);
      if (!updated) {
        return ResponseUtils.notFound(res, 'Meter not found');
      }

      ResponseUtils.success(res, null, 'Meter status updated successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to update meter status');
    }
  }

  // ===== METER READING ENDPOINTS =====

  /**
   * @swagger
   * /api/meters/{meterId}/readings:
   *   get:
   *     tags: ['Meter Readings']
   *     summary: Get meter readings by meter ID
   *     parameters:
   *       - in: path
   *         name: meterId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for filtering readings
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for filtering readings
   *     responses:
   *       200:
   *         description: List of meter readings
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 readings:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/MeterReading'
   */
  async getMeterReadings(req: Request, res: Response) {
    try {
      const { meterId } = req.params;
      const { startDate, endDate } = req.query;

      let readings;
      if (startDate && endDate) {
        readings = await this.meterReadingService.getMeterReadingsByMeterAndDateRange(
          meterId,
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        readings = await this.meterReadingService.getMeterReadingsByMeter(meterId);
      }

      ResponseUtils.success(res, { readings });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch meter readings');
    }
  }

  /**
   * @swagger
   * /api/meters/{meterId}/readings/latest:
   *   get:
   *     tags: ['Meter Readings']
   *     summary: Get latest meter reading
   *     parameters:
   *       - in: path
   *         name: meterId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Latest meter reading
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MeterReading'
   *       404:
   *         description: No readings found
   */
  async getLatestMeterReading(req: Request, res: Response) {
    try {
      const { meterId } = req.params;
      const reading = await this.meterReadingService.getLatestMeterReading(meterId);

      if (!reading) {
        return ResponseUtils.notFound(res, 'No readings found for this meter');
      }

      ResponseUtils.success(res, reading);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch latest meter reading');
    }
  }

  /**
   * @swagger
   * /api/meters/{meterId}/readings:
   *   post:
   *     tags: ['Meter Readings']
   *     summary: Create a new meter reading
   *     parameters:
   *       - in: path
   *         name: meterId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MeterReadingInput'
   *     responses:
   *       201:
   *         description: Meter reading created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MeterReading'
   */
  async createMeterReading(req: Request, res: Response) {
    try {
      const { meterId } = req.params;
      const readingData: MeterReadingInput = {
        ...req.body,
        meterId
      };

      const reading = await this.meterReadingService.createMeterReading(readingData);
      ResponseUtils.created(res, reading, 'Meter reading created successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('already exists')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to create meter reading');
      }
    }
  }

  /**
   * @swagger
   * /api/meters/readings/{id}:
   *   put:
   *     tags: ['Meter Readings']
   *     summary: Update meter reading
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MeterReadingInput'
   *     responses:
   *       200:
   *         description: Meter reading updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MeterReading'
   *       404:
   *         description: Meter reading not found
   */
  async updateMeterReading(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const readingData: Partial<MeterReadingInput> = req.body;

      const reading = await this.meterReadingService.updateMeterReading(id, readingData);
      if (!reading) {
        return ResponseUtils.notFound(res, 'Meter reading not found');
      }

      ResponseUtils.success(res, reading, 'Meter reading updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update meter reading');
      }
    }
  }

  /**
   * @swagger
   * /api/meters/readings/{id}:
   *   delete:
   *     tags: ['Meter Readings']
   *     summary: Delete meter reading
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Meter reading deleted
   *       404:
   *         description: Meter reading not found
   */
  async deleteMeterReading(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleted = await this.meterReadingService.deleteMeterReading(id);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'Meter reading not found');
      }

      ResponseUtils.success(res, null, 'Meter reading deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete meter reading');
    }
  }

  // ===== ANALYTICS ENDPOINTS =====

  /**
   * @swagger
   * /api/meters/{meterId}/trend:
   *   get:
   *     tags: ['Meter Analytics']
   *     summary: Get meter consumption trend data
   *     parameters:
   *       - in: path
   *         name: meterId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: months
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 24
   *           default: 6
   *         description: Number of months to include in trend
   *     responses:
   *       200:
   *         description: Meter trend data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 trend:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/MeterTrendData'
   */
  async getMeterTrend(req: Request, res: Response) {
    try {
      const { meterId } = req.params;
      const months = req.query.months ? parseInt(req.query.months as string) : 6;

      const trend = await this.meterReadingService.getMeterTrendData(meterId, months);
      ResponseUtils.success(res, { trend });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch meter trend data');
    }
  }

  /**
   * @swagger
   * /api/meters/{meterId}/statistics:
   *   get:
   *     tags: ['Meter Analytics']
   *     summary: Get meter statistics
   *     parameters:
   *       - in: path
   *         name: meterId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Meter statistics
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MeterStatistics'
   *       404:
   *         description: Meter not found or no data available
   */
  async getMeterStatistics(req: Request, res: Response) {
    try {
      const { meterId } = req.params;
      const statistics = await this.meterReadingService.getMeterStatistics(meterId);

      if (!statistics) {
        return ResponseUtils.notFound(res, 'Meter not found or no statistics available');
      }

      ResponseUtils.success(res, statistics);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch meter statistics');
    }
  }
}