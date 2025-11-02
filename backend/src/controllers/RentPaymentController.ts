import { Request, Response } from 'express';
import { IRentPaymentService } from '../interfaces/services/IRentPaymentService';
import { RentPaymentInput, PaymentStatus } from '../models/RentPayment';
import { ResponseUtils } from '../utils/response';
import { ErrorUtils } from '../utils/error';

export class RentPaymentController {
  private service: IRentPaymentService;

  constructor(service: IRentPaymentService) {
    this.service = service;
  }

  // Basic CRUD operations
  /**
   * @swagger
   * /api/rent-payments:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get all rent payments
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all rent payments
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
   *                     payments:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentPayment'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getAllPayments(req: Request, res: Response) {
    try {
      const payments = await this.service.getAllPayments();
      ResponseUtils.success(res, { payments });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch payments');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/{id}:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get rent payment by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Payment ID
   *     responses:
   *       200:
   *         description: Rent payment details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/RentPayment'
   *       404:
   *         description: Payment not found
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
  async getPaymentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await this.service.getPaymentById(id);
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
   * /api/rent-payments/lease/{leaseId}:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get payments by lease
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: leaseId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Lease ID
   *     responses:
   *       200:
   *         description: List of payments for the lease
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
   *                     payments:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentPayment'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getPaymentsByLease(req: Request, res: Response) {
    try {
      const { leaseId } = req.params;
      const payments = await this.service.getPaymentsByLease(leaseId);
      ResponseUtils.success(res, { payments });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch payments for lease');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/property/{propertyId}:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get payments by property
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
   *         description: List of payments for the property
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
   *                     payments:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentPayment'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getPaymentsByProperty(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const payments = await this.service.getPaymentsByProperty(propertyId);
      ResponseUtils.success(res, { payments });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch payments for property');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/tenant/{tenantId}:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get payments by tenant
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
   *         description: List of payments for the tenant
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
   *                     payments:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentPayment'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getPaymentsByTenant(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const payments = await this.service.getPaymentsByTenant(tenantId);
      ResponseUtils.success(res, { payments });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch payments for tenant');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/pending:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get pending payments
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of pending payments
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
   *                     payments:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentPayment'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getPendingPayments(req: Request, res: Response) {
    try {
      const payments = await this.service.getPendingPayments();
      ResponseUtils.success(res, { payments });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch pending payments');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/overdue:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get overdue payments
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of overdue payments
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
   *                     payments:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentPayment'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getOverduePayments(req: Request, res: Response) {
    try {
      const payments = await this.service.getOverduePayments();
      ResponseUtils.success(res, { payments });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch overdue payments');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/date-range:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get payments by date range
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for the range
   *       - in: query
   *         name: endDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for the range
   *     responses:
   *       200:
   *         description: List of payments within the date range
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
   *                     payments:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentPayment'
   *       400:
   *         description: Start date and end date are required or invalid date range
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
  async getPaymentsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return ResponseUtils.badRequest(res, 'Start date and end date are required');
      }

      const payments = await this.service.getPaymentsByDateRange(new Date(startDate as string), new Date(endDate as string));
      ResponseUtils.success(res, { payments });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Start date cannot be after end date')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch payments by date range');
    }
  }

  /**
   * @swagger
   * /api/rent-payments:
   *   post:
   *     tags: [Rent Payments]
   *     summary: Create a new rent payment
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RentPaymentInput'
   *     responses:
   *       201:
   *         description: Rent payment created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/RentPayment'
   *       400:
   *         description: Invalid payment data or related entities not found
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
  async createPayment(req: Request, res: Response) {
    try {
      const paymentData: RentPaymentInput = req.body;
      const payment = await this.service.createPayment(paymentData);
      ResponseUtils.created(res, payment);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid payment data') ||
          errorMessage.includes('Lease not found') ||
          errorMessage.includes('Property not found') ||
          errorMessage.includes('Tenant not found')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to create payment');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/{id}:
   *   put:
   *     tags: [Rent Payments]
   *     summary: Update an existing rent payment
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Payment ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               leaseId:
   *                 type: string
   *                 format: uuid
   *               propertyId:
   *                 type: string
   *                 format: uuid
   *               tenantId:
   *                 type: string
   *                 format: uuid
   *               amount:
   *                 type: number
   *               dueDate:
   *                 type: string
   *                 format: date
   *               paidDate:
   *                 type: string
   *                 format: date-time
   *               status:
   *                 type: string
   *                 enum: [pending, paid, overdue, partial, failed]
   *               paymentMethod:
   *                 type: string
   *                 enum: [cash, bank_transfer, upi, cheque, card, net_banking, paytm, phonepe, amazon_pay, other]
   *               transactionId:
   *                 type: string
   *               paymentReference:
   *                 type: string
   *               lateFee:
   *                 type: number
   *               penaltyAmount:
   *                 type: number
   *               rentAmount:
   *                 type: number
   *               maintenanceCharges:
   *                 type: number
   *               otherCharges:
   *                 type: number
   *               notes:
   *                 type: string
   *               createdBy:
   *                 type: string
   *                 format: uuid
   *               updatedBy:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       200:
   *         description: Rent payment updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/RentPayment'
   *       400:
   *         description: Invalid payment data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Payment not found
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
  async updatePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paymentData: Partial<RentPaymentInput> = req.body;
      const payment = await this.service.updatePayment(id, paymentData);
      if (!payment) {
        return ResponseUtils.notFound(res, 'Payment not found');
      }
      ResponseUtils.success(res, payment);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid payment data')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to update payment');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/{id}:
   *   delete:
   *     tags: [Rent Payments]
   *     summary: Delete a rent payment
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Payment ID
   *     responses:
   *       200:
   *         description: Payment deleted successfully
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
   *                       example: "Payment deleted successfully"
   *       400:
   *         description: Only pending payments can be deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Payment not found
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
  async deletePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await this.service.deletePayment(id);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'Payment not found');
      }
      ResponseUtils.success(res, { message: 'Payment deleted successfully' });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Only pending payments can be deleted')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to delete payment');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/{id}/mark-paid:
   *   post:
   *     tags: [Rent Payments]
   *     summary: Mark a payment as paid
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Payment ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - paidDate
   *             properties:
   *               paidDate:
   *                 type: string
   *                 format: date-time
   *                 description: Date when payment was made
   *               paymentMethod:
   *                 type: string
   *                 enum: [cash, bank_transfer, upi, cheque, card, net_banking, paytm, phonepe, amazon_pay, other]
   *                 description: Payment method used
   *               transactionId:
   *                 type: string
   *                 description: Transaction reference ID
   *     responses:
   *       200:
   *         description: Payment marked as paid successfully
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
   *                       example: "Payment marked as paid successfully"
   *       400:
   *         description: Paid date is required or invalid payment method
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Payment not found
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
  async markPaymentAsPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { paidDate, paymentMethod, transactionId } = req.body;

      if (!paidDate) {
        return ResponseUtils.badRequest(res, 'Paid date is required');
      }

      const success = await this.service.markPaymentAsPaid(id, new Date(paidDate), paymentMethod, transactionId);
      if (!success) {
        return ResponseUtils.notFound(res, 'Payment not found');
      }
      ResponseUtils.success(res, { message: 'Payment marked as paid successfully' });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid payment method')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to mark payment as paid');
    }
  }

  // Financial calculations and reports
  /**
   * @swagger
   * /api/rent-payments/calculate-late-fees:
   *   post:
   *     tags: [Rent Payments]
   *     summary: Calculate late fees for a payment
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *               - dueDate
   *             properties:
   *               amount:
   *                 type: number
   *                 description: Payment amount
   *               dueDate:
   *                 type: string
   *                 format: date
   *                 description: Due date of the payment
   *               paidDate:
   *                 type: string
   *                 format: date
   *                 description: Date when payment was made (optional, defaults to current date)
   *     responses:
   *       200:
   *         description: Late fees calculation result
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
   *                     lateFees:
   *                       type: number
   *                       description: Calculated late fees amount
   *       400:
   *         description: Amount and due date are required
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
  async calculateLateFees(req: Request, res: Response) {
    try {
      const { amount, dueDate, paidDate } = req.body;

      if (!amount || !dueDate) {
        return ResponseUtils.badRequest(res, 'Amount and due date are required');
      }

      const lateFees = this.service.calculateLateFees(amount, new Date(dueDate), paidDate ? new Date(paidDate) : undefined);
      ResponseUtils.success(res, { lateFees });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to calculate late fees');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/generate-monthly:
   *   post:
   *     tags: [Rent Payments]
   *     summary: Generate monthly payments for a lease
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - leaseId
   *               - startDate
   *               - endDate
   *             properties:
   *               leaseId:
   *                 type: string
   *                 format: uuid
   *                 description: Lease ID
   *               startDate:
   *                 type: string
   *                 format: date
   *                 description: Start date for payment generation
   *               endDate:
   *                 type: string
   *                 format: date
   *                 description: End date for payment generation
   *     responses:
   *       200:
   *         description: Monthly payments generated successfully
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
   *                     payments:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentPayment'
   *                     count:
   *                       type: integer
   *                       description: Number of payments generated
   *       400:
   *         description: Required fields missing or lease not found
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
  async generateMonthlyPayments(req: Request, res: Response) {
    try {
      const { leaseId, startDate, endDate } = req.body;

      if (!leaseId || !startDate || !endDate) {
        return ResponseUtils.badRequest(res, 'Lease ID, start date, and end date are required');
      }

      const payments = await this.service.generateMonthlyPayments(leaseId, new Date(startDate), new Date(endDate));
      ResponseUtils.success(res, { payments, count: payments.length });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Lease not found') ||
          errorMessage.includes('Start date cannot be after end date')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to generate monthly payments');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/revenue/property/{propertyId}:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get total revenue by property
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
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for revenue calculation (optional)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for revenue calculation (optional)
   *     responses:
   *       200:
   *         description: Total revenue for the property
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
   *                     propertyId:
   *                       type: string
   *                       format: uuid
   *                     totalRevenue:
   *                       type: number
   *                       description: Total revenue amount
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getTotalRevenueByProperty(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { startDate, endDate } = req.query;

      const revenue = await this.service.getTotalRevenueByProperty(
        propertyId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      ResponseUtils.success(res, { propertyId, totalRevenue: revenue });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to get total revenue by property');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/revenue/owner/{ownerId}:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get total revenue by owner
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: ownerId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Owner ID
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for revenue calculation (optional)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for revenue calculation (optional)
   *     responses:
   *       200:
   *         description: Total revenue for the owner
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
   *                     ownerId:
   *                       type: string
   *                       format: uuid
   *                     totalRevenue:
   *                       type: number
   *                       description: Total revenue amount
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getTotalRevenueByOwner(req: Request, res: Response) {
    try {
      const { ownerId } = req.params;
      const { startDate, endDate } = req.query;

      const revenue = await this.service.getTotalRevenueByOwner(
        ownerId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      ResponseUtils.success(res, { ownerId, totalRevenue: revenue });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to get total revenue by owner');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/outstanding:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get total outstanding payments amount
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Total outstanding payments amount
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
   *                     outstandingAmount:
   *                       type: number
   *                       description: Total amount of outstanding payments
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getOutstandingPayments(req: Request, res: Response) {
    try {
      const outstanding = await this.service.getOutstandingPayments();
      ResponseUtils.success(res, { outstandingAmount: outstanding });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to get outstanding payments');
    }
  }

  /**
   * @swagger
   * /api/rent-payments/reports/monthly/{year}/{month}:
   *   get:
   *     tags: [Rent Payments]
   *     summary: Get monthly revenue report
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: year
   *         required: true
   *         schema:
   *           type: integer
   *         description: Year for the report
   *       - in: path
   *         name: month
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *         description: Month for the report (1-12)
   *     responses:
   *       200:
   *         description: Monthly revenue report
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
   *                     report:
   *                       type: object
   *                       description: Monthly revenue report data
   *       400:
   *         description: Year and month are required or invalid month
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
  async getMonthlyRevenueReport(req: Request, res: Response) {
    try {
      const { year, month } = req.params;

      if (!year || !month) {
        return ResponseUtils.badRequest(res, 'Year and month are required');
      }

      const report = await this.service.getMonthlyRevenueReport(parseInt(year), parseInt(month));
      ResponseUtils.success(res, { report });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Month must be between 1 and 12')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to get monthly revenue report');
    }
  }
}