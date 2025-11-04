import { Request, Response } from 'express';
import { IRentTransactionService } from '../interfaces/services/IRentTransactionService';
import { RentTransactionInput, RentTransactionStatus, BillingMethod } from '../models/RentTransaction';
import { ResponseUtils } from '../utils/response';
import { ErrorUtils } from '../utils/error';

export class RentTransactionController {
  private service: IRentTransactionService;

  constructor(service: IRentTransactionService) {
    this.service = service;
  }

  // Basic CRUD operations
  /**
   * @swagger
   * /api/rent-transactions:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get all rent transactions
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all rent transactions
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
   *                     transactions:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentTransaction'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getAllTransactions(req: Request, res: Response) {
    try {
      const transactions = await this.service.getAllTransactions();
      ResponseUtils.success(res, transactions, 'Transactions retrieved successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch transactions');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/{id}:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get rent transaction by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Transaction ID
   *     responses:
   *       200:
   *         description: Rent transaction details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/RentTransaction'
   *       404:
   *         description: Transaction not found
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
  async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await this.service.getTransactionById(id);
      if (!transaction) {
        return ResponseUtils.notFound(res, 'Transaction not found');
      }
      ResponseUtils.success(res, transaction);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch transaction');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/lease/{leaseId}:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get transactions by lease
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
   *         description: List of transactions for the lease
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
   *                     transactions:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentTransaction'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getTransactionsByLease(req: Request, res: Response) {
    try {
      const { leaseId } = req.params;
      const transactions = await this.service.getTransactionsByLease(leaseId);
      ResponseUtils.success(res, transactions, 'Transactions retrieved successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch transactions for lease');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/property/{propertyId}:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get transactions by property
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
   *         description: List of transactions for the property
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
   *                     transactions:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentTransaction'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getTransactionsByProperty(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const transactions = await this.service.getTransactionsByProperty(propertyId);
      ResponseUtils.success(res, transactions, 'Transactions retrieved successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch transactions for property');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/tenant/{tenantId}:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get transactions by tenant
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
   *         description: List of transactions for the tenant
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
   *                     transactions:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentTransaction'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getTransactionsByTenant(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const transactions = await this.service.getTransactionsByTenant(tenantId);
      ResponseUtils.success(res, transactions, 'Transactions retrieved successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch transactions for tenant');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/pending:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get pending transactions
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of pending transactions
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
   *                     transactions:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentTransaction'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getPendingTransactions(req: Request, res: Response) {
    try {
      const transactions = await this.service.getPendingTransactions();
      ResponseUtils.success(res, transactions, 'Pending transactions retrieved successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch pending transactions');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/overdue:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get overdue transactions
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of overdue transactions
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
   *                     transactions:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentTransaction'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getOverdueTransactions(req: Request, res: Response) {
    try {
      const transactions = await this.service.getOverdueTransactions();
      ResponseUtils.success(res, transactions, 'Overdue transactions retrieved successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch overdue transactions');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/date-range:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get transactions by date range
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
   *         description: List of transactions within the date range
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
   *                     transactions:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentTransaction'
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
  async getTransactionsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return ResponseUtils.badRequest(res, 'Start date and end date are required');
      }

      const transactions = await this.service.getTransactionsByDateRange(new Date(startDate as string), new Date(endDate as string));
      ResponseUtils.success(res, transactions, 'Transactions retrieved successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Start date cannot be after end date')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch transactions by date range');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions:
   *   post:
   *     tags: [Rent Transactions]
   *     summary: Create a new rent transaction
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RentTransactionInput'
   *     responses:
   *       201:
   *         description: Rent transaction created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/RentTransaction'
   *       400:
   *         description: Invalid transaction data or related entities not found
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
  async createTransaction(req: Request, res: Response) {
    try {
      const transactionData: RentTransactionInput = req.body;
      const transaction = await this.service.createTransaction(transactionData);
      ResponseUtils.created(res, transaction);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid transaction data') ||
          errorMessage.includes('Lease not found') ||
          errorMessage.includes('Property not found') ||
          errorMessage.includes('Tenant not found')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to create transaction');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/{id}:
   *   put:
   *     tags: [Rent Transactions]
   *     summary: Update an existing rent transaction
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Transaction ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               billingPeriodStart:
   *                 type: string
   *                 format: date
   *               billingPeriodEnd:
   *                 type: string
   *                 format: date
   *               billingMethod:
   *                 type: string
   *                 enum: [relative, fixed]
   *               daysCount:
   *                 type: integer
   *               baseRent:
   *                 type: number
   *               previousBalance:
   *                 type: number
   *               expenses:
   *                 type: array
   *                 items:
   *                   type: object
   *               totalAmount:
   *                 type: number
   *               amountPaid:
   *                 type: number
   *               newBalance:
   *                 type: number
   *               paidDate:
   *                 type: string
   *                 format: date-time
   *               status:
   *                 type: string
   *                 enum: [draft, finalized, paid, cancelled]
   *               receiptNumber:
   *                 type: string
   *               receiptGenerated:
   *                 type: boolean
   *               notes:
   *                 type: string
   *               updatedBy:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       200:
   *         description: Rent transaction updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/RentTransaction'
   *       400:
   *         description: Invalid transaction data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Transaction not found
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
  async updateTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transactionData: Partial<RentTransactionInput> = req.body;
      const transaction = await this.service.updateTransaction(id, transactionData);
      if (!transaction) {
        return ResponseUtils.notFound(res, 'Transaction not found');
      }
      ResponseUtils.success(res, transaction);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid transaction data')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to update transaction');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/{id}:
   *   delete:
   *     tags: [Rent Transactions]
   *     summary: Delete a rent transaction
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Transaction ID
   *     responses:
   *       200:
   *         description: Transaction deleted successfully
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
   *                       example: "Transaction deleted successfully"
   *       400:
   *         description: Only draft transactions can be deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Transaction not found
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
  async deleteTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await this.service.deleteTransaction(id);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'Transaction not found');
      }
      ResponseUtils.success(res, { message: 'Transaction deleted successfully' });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Only draft transactions can be deleted')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to delete transaction');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/{id}/mark-paid:
   *   post:
   *     tags: [Rent Transactions]
   *     summary: Mark a transaction as paid
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Transaction ID
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
   *                 description: Payment method used
   *               transactionId:
   *                 type: string
   *                 description: Transaction reference ID
   *     responses:
   *       200:
   *         description: Transaction marked as paid successfully
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
   *                       example: "Transaction marked as paid successfully"
   *       400:
   *         description: Paid date is required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Transaction not found
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
  async markTransactionAsPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { paidDate, paymentMethod, transactionId } = req.body;

      if (!paidDate) {
        return ResponseUtils.badRequest(res, 'Paid date is required');
      }

      const success = await this.service.markTransactionAsPaid(id, new Date(paidDate), paymentMethod, transactionId);
      if (!success) {
        return ResponseUtils.notFound(res, 'Transaction not found');
      }
      ResponseUtils.success(res, { message: 'Transaction marked as paid successfully' });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to mark transaction as paid');
    }
  }

  // Financial calculations and reports
  /**
   * @swagger
   * /api/rent-transactions/calculate-late-fees:
   *   post:
   *     tags: [Rent Transactions]
   *     summary: Calculate late fees for a transaction
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
   *                 description: Transaction amount
   *               dueDate:
   *                 type: string
   *                 format: date
   *                 description: Due date of the transaction
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
   * /api/rent-transactions/generate-monthly:
   *   post:
   *     tags: [Rent Transactions]
   *     summary: Generate monthly transactions for a lease
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
   *                 description: Start date for transaction generation
   *               endDate:
   *                 type: string
   *                 format: date
   *                 description: End date for transaction generation
   *     responses:
   *       200:
   *         description: Monthly transactions generated successfully
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
   *                     transactions:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RentTransaction'
   *                     count:
   *                       type: integer
   *                       description: Number of transactions generated
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
  async generateMonthlyTransactions(req: Request, res: Response) {
    try {
      const { leaseId, startDate, endDate } = req.body;

      if (!leaseId || !startDate || !endDate) {
        return ResponseUtils.badRequest(res, 'Lease ID, start date, and end date are required');
      }

      const transactions = await this.service.generateMonthlyTransactions(leaseId, new Date(startDate), new Date(endDate));
      ResponseUtils.success(res, { transactions, count: transactions.length });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Lease not found') ||
          errorMessage.includes('Start date cannot be after end date')) {
        return ResponseUtils.badRequest(res, errorMessage);
      }
      ErrorUtils.handleGenericError(res, err, 'Failed to generate monthly transactions');
    }
  }

  // Balance tracking
  /**
   * @swagger
   * /api/rent-transactions/balance/lease/{leaseId}:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get current balance by lease
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
   *         description: Current balance for the lease
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
   *                     leaseId:
   *                       type: string
   *                       format: uuid
   *                     balance:
   *                       type: number
   *                       description: Current balance amount
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getCurrentBalanceByLease(req: Request, res: Response) {
    try {
      const { leaseId } = req.params;
      const balance = await this.service.getCurrentBalanceByLease(leaseId);
      ResponseUtils.success(res, { leaseId, balance });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to get current balance by lease');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/balance/tenant/{tenantId}:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get current balance by tenant
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
   *         description: Current balance for the tenant
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
   *                     tenantId:
   *                       type: string
   *                       format: uuid
   *                     balance:
   *                       type: number
   *                       description: Current balance amount
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getCurrentBalanceByTenant(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const balance = await this.service.getCurrentBalanceByTenant(tenantId);
      ResponseUtils.success(res, { tenantId, balance });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to get current balance by tenant');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/balance/property/{propertyId}:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get current balance by property
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
   *         description: Current balance for the property
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
   *                     balance:
   *                       type: number
   *                       description: Current balance amount
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getCurrentBalanceByProperty(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const balance = await this.service.getCurrentBalanceByProperty(propertyId);
      ResponseUtils.success(res, { propertyId, balance });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to get current balance by property');
    }
  }

  // Financial summaries
  /**
   * @swagger
   * /api/rent-transactions/revenue/property/{propertyId}:
   *   get:
   *     tags: [Rent Transactions]
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
   * /api/rent-transactions/revenue/owner/{ownerId}:
   *   get:
   *     tags: [Rent Transactions]
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
   * /api/rent-transactions/outstanding:
   *   get:
   *     tags: [Rent Transactions]
   *     summary: Get total outstanding transactions amount
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Total outstanding transactions amount
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
   *                       description: Total amount of outstanding transactions
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getOutstandingTransactions(req: Request, res: Response) {
    try {
      const outstanding = await this.service.getOutstandingTransactions();
      ResponseUtils.success(res, { outstandingAmount: outstanding });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to get outstanding transactions');
    }
  }

  /**
   * @swagger
   * /api/rent-transactions/reports/monthly/{year}/{month}:
   *   get:
   *     tags: [Rent Transactions]
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