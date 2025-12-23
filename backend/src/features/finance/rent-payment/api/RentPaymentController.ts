
import { Request, Response } from 'express';
import { RentPaymentService } from '../core/RentPaymentService';
import { ResponseUtils } from '@/shared/utils/response';
import { ErrorUtils } from '@/shared/utils/error';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('RentPaymentController');

/**
 * @swagger
 * tags:
 *   name: Rent Payments
 *   description: Rent payment management endpoints
 */
export class RentPaymentController {
  constructor(private readonly service: RentPaymentService) {}

  /**
   * @swagger
   * /rent-payments:
   *   get:
   *     summary: Get all rent payments
   *     tags: [Rent Payments]
   *     responses:
   *       200:
   *         description: List of rent payments
   *       500:
   *         description: Internal server error
   */
  async getAllPayments(req: Request, res: Response) {
    try {
      const payments = await this.service.getAllPayments();
      ResponseUtils.success(res, payments);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch payments');
    }
  }

  /**
   * @swagger
   * /rent-payments/{id}:
   *   get:
   *     summary: Get a rent payment by ID
   *     tags: [Rent Payments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Payment ID
   *     responses:
   *       200:
   *         description: Payment details
   *       404:
   *         description: Payment not found
   *       500:
   *         description: Internal server error
   */
  async getPaymentById(req: Request, res: Response) {
    try {
      const payment = await this.service.getPaymentById(req.params.id);
      if (!payment) {
        return ResponseUtils.notFound(res, 'Payment not found');
      }
      ResponseUtils.success(res, payment);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch payment');
    }
  }

  /**
   * @swagger
   * /rent-payments/lease/{leaseId}:
   *   get:
   *     summary: Get rent payments by Lease ID
   *     tags: [Rent Payments]
   *     parameters:
   *       - in: path
   *         name: leaseId
   *         required: true
   *         schema:
   *           type: string
   *         description: Lease ID
   *     responses:
   *       200:
   *         description: List of rent payments for the lease
   *       500:
   *         description: Internal server error
   */
  async getPaymentsByLease(req: Request, res: Response) {
    try {
      const payments = await this.service.getPaymentsByLease(req.params.leaseId);
      ResponseUtils.success(res, payments);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch lease payments');
    }
  }

  /**
   * @swagger
   * /rent-payments/property/{propertyId}:
   *   get:
   *     summary: Get rent payments by Property ID
   *     tags: [Rent Payments]
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     responses:
   *       200:
   *         description: List of rent payments for the property
   *       500:
   *         description: Internal server error
   */
  async getPaymentsByProperty(req: Request, res: Response) {
    try {
      const payments = await this.service.getPaymentsByProperty(req.params.propertyId);
      ResponseUtils.success(res, payments);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch property payments');
    }
  }

  /**
   * @swagger
   * /rent-payments/tenant/{tenantId}:
   *   get:
   *     summary: Get rent payments by Tenant ID
   *     tags: [Rent Payments]
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Tenant ID
   *     responses:
   *       200:
   *         description: List of rent payments for the tenant
   *       500:
   *         description: Internal server error
   */
  async getPaymentsByTenant(req: Request, res: Response) {
    try {
      const payments = await this.service.getPaymentsByTenant(req.params.tenantId);
      ResponseUtils.success(res, payments);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch tenant payments');
    }
  }

  /**
   * @swagger
   * /rent-payments:
   *   post:
   *     summary: Create a new rent payment
   *     tags: [Rent Payments]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - leaseId
   *               - amount
   *               - paymentDate
   *               - paymentMethod
   *             properties:
   *               leaseId:
   *                 type: string
   *               amount:
   *                 type: number
   *               paymentDate:
   *                 type: string
   *                 format: date
   *               paymentMethod:
   *                 type: string
   *               referenceNumber:
   *                 type: string
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Payment created successfully
   *       500:
   *         description: Internal server error
   */
  async createPayment(req: Request, res: Response) {
    try {
      const payment = await this.service.createPayment(req.body);
      ResponseUtils.created(res, payment);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to create payment');
    }
  }

  /**
   * @swagger
   * /rent-payments/{id}:
   *   put:
   *     summary: Update a rent payment
   *     tags: [Rent Payments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Payment ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: number
   *               paymentDate:
   *                 type: string
   *                 format: date
   *               paymentMethod:
   *                 type: string
   *               referenceNumber:
   *                 type: string
   *               notes:
   *                 type: string
   *     responses:
   *       200:
   *         description: Payment updated successfully
   *       404:
   *         description: Payment not found
   *       500:
   *         description: Internal server error
   */
  async updatePayment(req: Request, res: Response) {
    try {
      const payment = await this.service.updatePayment(req.params.id, req.body);
      if (!payment) {
        return ResponseUtils.notFound(res, 'Payment not found');
      }
      ResponseUtils.success(res, payment);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to update payment');
    }
  }

  /**
   * @swagger
   * /rent-payments/{id}:
   *   delete:
   *     summary: Delete a rent payment
   *     tags: [Rent Payments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Payment ID
   *     responses:
   *       204:
   *         description: Payment deleted successfully
   *       404:
   *         description: Payment not found
   *       500:
   *         description: Internal server error
   */
  async deletePayment(req: Request, res: Response) {
    try {
      const success = await this.service.deletePayment(req.params.id);
      if (!success) {
        return ResponseUtils.notFound(res, 'Payment not found');
      }
      ResponseUtils.noContent(res);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete payment');
    }
  }
}
