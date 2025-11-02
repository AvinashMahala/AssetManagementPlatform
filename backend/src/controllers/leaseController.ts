import { Request, Response } from 'express';
import { ILeaseService } from '../interfaces/services/ILeaseService';
import { LeaseInput } from '../models/Lease';
import { ResponseUtils } from '../utils/response';
import { ErrorUtils } from '../utils/error';

export class LeaseController {
  private service: ILeaseService;

  constructor(service: ILeaseService) {
    this.service = service;
  }

  // Basic CRUD operations
  /**
   * @swagger
   * /api/leases:
   *   get:
   *     tags: [Leases]
   *     summary: Get all leases
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all leases
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     leases:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Lease'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getAllLeases(req: Request, res: Response) {
    try {
      const leases = await this.service.getAllLeases();
      ResponseUtils.success(res, { leases });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch leases');
    }
  }

  /**
   * @swagger
   * /api/leases/{id}:
   *   get:
   *     tags: [Leases]
   *     summary: Get lease by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Lease ID
   *     responses:
   *       200:
   *         description: Lease details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Lease'
   *       404:
   *         description: Lease not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getLeaseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const lease = await this.service.getLeaseById(id);
      if (!lease) {
        return ResponseUtils.notFound(res, 'Lease not found');
      }
      ResponseUtils.success(res, lease);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch lease');
    }
  }

  /**
   * @swagger
   * /api/leases/property/{propertyId}:
   *   get:
   *     tags: [Leases]
   *     summary: Get leases by property
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Property ID
   *     responses:
   *       200:
   *         description: List of leases for the property
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     leases:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Lease'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getLeasesByProperty(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const leases = await this.service.getLeasesByProperty(propertyId);
      ResponseUtils.success(res, { leases });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch leases for property');
    }
  }

  /**
   * @swagger
   * /api/leases/tenant/{tenantId}:
   *   get:
   *     tags: [Leases]
   *     summary: Get leases by tenant
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID
   *     responses:
   *       200:
   *         description: List of leases for the tenant
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     leases:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Lease'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getLeasesByTenant(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const leases = await this.service.getLeasesByTenant(tenantId);
      ResponseUtils.success(res, { leases });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch leases for tenant');
    }
  }

  /**
   * @swagger
   * /api/leases/active:
   *   get:
   *     tags: [Leases]
   *     summary: Get active leases
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of active leases
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     leases:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Lease'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getActiveLeases(req: Request, res: Response) {
    try {
      const leases = await this.service.getActiveLeases();
      ResponseUtils.success(res, { leases });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch active leases');
    }
  }

  /**
   * @swagger
   * /api/leases/expiring:
   *   get:
   *     tags: [Leases]
   *     summary: Get expiring leases
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: integer
   *           default: 30
   *         description: Number of days to look ahead for expiring leases
   *     responses:
   *       200:
   *         description: List of expiring leases
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     leases:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Lease'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getExpiringLeases(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const leases = await this.service.getExpiringLeases(days);
      ResponseUtils.success(res, { leases });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch expiring leases');
    }
  }

  /**
   * @swagger
   * /api/leases:
   *   post:
   *     tags: [Leases]
   *     summary: Create a new lease
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LeaseInput'
   *     responses:
   *       201:
   *         description: Lease created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Lease'
   *       400:
   *         description: Invalid lease data or dates
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async createLease(req: Request, res: Response) {
    try {
      const leaseData: LeaseInput = req.body;
      const lease = await this.service.createLease(leaseData);
      ResponseUtils.created(res, lease);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid lease data') ||
          errorMessage.includes('Invalid lease dates') ||
          errorMessage.includes('not available')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to create lease');
    }
  }

  /**
   * @swagger
   * /api/leases/{id}:
   *   put:
   *     tags: [Leases]
   *     summary: Update an existing lease
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Lease ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               propertyId:
   *                 type: string
   *                 format: uuid
   *               tenantId:
   *                 type: string
   *                 format: uuid
   *               startDate:
   *                 type: string
   *                 format: date-time
   *               endDate:
   *                 type: string
   *                 format: date-time
   *               monthlyRent:
   *                 type: number
   *               securityDeposit:
   *                 type: number
   *               status:
   *                 type: string
   *                 enum: [draft, active, expired, terminated]
   *               noticePeriodDays:
   *                 type: integer
   *               autoRenewal:
   *                 type: boolean
   *               maintenanceCharges:
   *                 type: number
   *               paymentFrequency:
   *                 type: string
   *               rentDueDay:
   *                 type: integer
   *               electricityCharges:
   *                 type: number
   *               waterCharges:
   *                 type: number
   *               otherCharges:
   *                 type: number
   *               petsAllowed:
   *                 type: boolean
   *               smokingAllowed:
   *                 type: boolean
   *               sublettingAllowed:
   *                 type: boolean
   *               specialConditions:
   *                 type: string
   *               signedAt:
   *                 type: string
   *                 format: date-time
   *               leaseDocumentUrl:
   *                 type: string
   *     responses:
   *       200:
   *         description: Lease updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Lease'
   *       400:
   *         description: Invalid lease dates
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Lease not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async updateLease(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const leaseData: Partial<LeaseInput> = req.body;
      const lease = await this.service.updateLease(id, leaseData);
      if (!lease) {
        return ResponseUtils.notFound(res, 'Lease not found');
      }
      ResponseUtils.success(res, lease);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid lease dates') ||
          errorMessage.includes('not available')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to update lease');
    }
  }

  /**
   * @swagger
   * /api/leases/{id}:
   *   delete:
   *     tags: [Leases]
   *     summary: Delete a lease
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Lease ID
   *     responses:
   *       200:
   *         description: Lease deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "Lease deleted successfully"
   *       400:
   *         description: Only draft leases can be deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Lease not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async deleteLease(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await this.service.deleteLease(id);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'Lease not found');
      }
      ResponseUtils.success(res, { message: 'Lease deleted successfully' });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Only draft leases can be deleted')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to delete lease');
    }
  }

  /**
   * @swagger
   * /api/leases/{id}/terminate:
   *   post:
   *     tags: [Leases]
   *     summary: Terminate a lease
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Lease ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - terminationReason
   *             properties:
   *               terminationReason:
   *                 type: string
   *                 description: Reason for lease termination
   *     responses:
   *       200:
   *         description: Lease terminated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "Lease terminated successfully"
   *       400:
   *         description: Only active leases can be terminated or missing termination reason
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Lease not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async terminateLease(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { terminationReason } = req.body;

      if (!terminationReason) {
        return ResponseUtils.badRequest(res, 'Termination reason is required');
      }

      const terminated = await this.service.terminateLease(id, terminationReason);
      if (!terminated) {
        return ResponseUtils.notFound(res, 'Lease not found');
      }
      ResponseUtils.success(res, { message: 'Lease terminated successfully' });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Only active leases can be terminated')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to terminate lease');
    }
  }

  /**
   * @swagger
   * /api/leases/{id}/renew:
   *   post:
   *     tags: [Leases]
   *     summary: Renew a lease
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Lease ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - newEndDate
   *             properties:
   *               newEndDate:
   *                 type: string
   *                 format: date-time
   *                 description: New end date for the lease
   *     responses:
   *       200:
   *         description: Lease renewed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Lease'
   *       400:
   *         description: Only active leases can be renewed or new end date must be after current end date
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Lease not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async renewLease(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newEndDate } = req.body;

      if (!newEndDate) {
        return ResponseUtils.badRequest(res, 'New end date is required');
      }

      const renewedLease = await this.service.renewLease(id, new Date(newEndDate));
      if (!renewedLease) {
        return ResponseUtils.notFound(res, 'Lease not found');
      }
      ResponseUtils.success(res, renewedLease);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Only active leases can be renewed') ||
          errorMessage.includes('New end date must be after current end date')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to renew lease');
    }
  }

  // Validation helpers
  /**
   * @swagger
   * /api/leases/validate-dates:
   *   post:
   *     tags: [Leases]
   *     summary: Validate lease dates
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - startDate
   *               - endDate
   *             properties:
   *               startDate:
   *                 type: string
   *                 format: date-time
   *                 description: Lease start date
   *               endDate:
   *                 type: string
   *                 format: date-time
   *                 description: Lease end date
   *     responses:
   *       200:
   *         description: Date validation result
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     isValid:
   *                       type: boolean
   *                       description: Whether the dates are valid
   *       400:
   *         description: Start date and end date are required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async validateLeaseDates(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return ResponseUtils.badRequest(res, 'Start date and end date are required');
      }

      const isValid = this.service.validateLeaseDates(new Date(startDate), new Date(endDate));
      ResponseUtils.success(res, { isValid });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to validate lease dates');
    }
  }

  /**
   * @swagger
   * /api/leases/check-availability:
   *   post:
   *     tags: [Leases]
   *     summary: Check property availability for lease dates
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - propertyId
   *               - startDate
   *               - endDate
   *             properties:
   *               propertyId:
   *                 type: string
   *                 format: uuid
   *                 description: Property ID
   *               startDate:
   *                 type: string
   *                 format: date-time
   *                 description: Lease start date
   *               endDate:
   *                 type: string
   *                 format: date-time
   *                 description: Lease end date
   *     responses:
   *       200:
   *         description: Property availability result
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     isAvailable:
   *                       type: boolean
   *                       description: Whether the property is available for the given dates
   *       400:
   *         description: Property ID, start date, and end date are required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async checkPropertyAvailability(req: Request, res: Response) {
    try {
      const { propertyId, startDate, endDate } = req.body;

      if (!propertyId || !startDate || !endDate) {
        return ResponseUtils.badRequest(res, 'Property ID, start date, and end date are required');
      }

      const isAvailable = await this.service.checkPropertyAvailability(
        propertyId,
        new Date(startDate),
        new Date(endDate)
      );
      ResponseUtils.success(res, { isAvailable });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to check property availability');
    }
  }

  /**
   * @swagger
   * /api/leases/calculate-duration:
   *   post:
   *     tags: [Leases]
   *     summary: Calculate lease duration in months
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - startDate
   *               - endDate
   *             properties:
   *               startDate:
   *                 type: string
   *                 format: date-time
   *                 description: Lease start date
   *               endDate:
   *                 type: string
   *                 format: date-time
   *                 description: Lease end date
   *     responses:
   *       200:
   *         description: Lease duration calculation result
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     durationInMonths:
   *                       type: integer
   *                       description: Duration of the lease in months
   *       400:
   *         description: Start date and end date are required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async calculateLeaseDuration(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return ResponseUtils.badRequest(res, 'Start date and end date are required');
      }

      const duration = this.service.calculateLeaseDuration(new Date(startDate), new Date(endDate));
      ResponseUtils.success(res, { durationInMonths: duration });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to calculate lease duration');
    }
  }
}