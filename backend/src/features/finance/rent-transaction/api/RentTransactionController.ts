
import { Request, Response } from 'express';
import { RentTransactionService } from '../core/RentTransactionService';
import { ResponseUtils } from '@/shared/utils/response';
import { ErrorUtils } from '@/shared/utils/error';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('RentTransactionController');

/**
 * @swagger
 * tags:
 *   name: Rent Transactions
 *   description: Rent transaction management endpoints
 */
export class RentTransactionController {
  constructor(private readonly service: RentTransactionService) {}

  /**
   * @swagger
   * /rent-transactions:
   *   get:
   *     summary: Get all rent transactions
   *     tags: [Rent Transactions]
   *     responses:
   *       200:
   *         description: List of rent transactions
   *       500:
   *         description: Internal server error
   */
  async getAllTransactions(req: Request, res: Response) {
    try {
      const transactions = await this.service.getAllTransactions();
      ResponseUtils.success(res, transactions);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch transactions');
    }
  }

  /**
   * @swagger
   * /rent-transactions/{id}:
   *   get:
   *     summary: Get a rent transaction by ID
   *     tags: [Rent Transactions]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID
   *     responses:
   *       200:
   *         description: Transaction details
   *       404:
   *         description: Transaction not found
   *       500:
   *         description: Internal server error
   */
  async getTransactionById(req: Request, res: Response) {
    try {
      const transaction = await this.service.getTransactionById(req.params.id);
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
   * /rent-transactions/lease/{leaseId}:
   *   get:
   *     summary: Get rent transactions by Lease ID
   *     tags: [Rent Transactions]
   *     parameters:
   *       - in: path
   *         name: leaseId
   *         required: true
   *         schema:
   *           type: string
   *         description: Lease ID
   *     responses:
   *       200:
   *         description: List of rent transactions for the lease
   *       500:
   *         description: Internal server error
   */
  async getTransactionsByLease(req: Request, res: Response) {
    try {
      const transactions = await this.service.getTransactionsByLease(req.params.leaseId);
      ResponseUtils.success(res, transactions);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch lease transactions');
    }
  }

  /**
   * @swagger
   * /rent-transactions/property/{propertyId}:
   *   get:
   *     summary: Get rent transactions by Property ID
   *     tags: [Rent Transactions]
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     responses:
   *       200:
   *         description: List of rent transactions for the property
   *       500:
   *         description: Internal server error
   */
  async getTransactionsByProperty(req: Request, res: Response) {
    try {
      const transactions = await this.service.getTransactionsByProperty(req.params.propertyId);
      ResponseUtils.success(res, transactions);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch property transactions');
    }
  }

  /**
   * @swagger
   * /rent-transactions/tenant/{tenantId}:
   *   get:
   *     summary: Get rent transactions by Tenant ID
   *     tags: [Rent Transactions]
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Tenant ID
   *     responses:
   *       200:
   *         description: List of rent transactions for the tenant
   *       500:
   *         description: Internal server error
   */
  async getTransactionsByTenant(req: Request, res: Response) {
    try {
      const transactions = await this.service.getTransactionsByTenant(req.params.tenantId);
      ResponseUtils.success(res, transactions);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch tenant transactions');
    }
  }

  /**
   * @swagger
   * /rent-transactions/unit/{unitId}:
   *   get:
   *     summary: Get rent transactions by Unit ID
   *     tags: [Rent Transactions]
   *     parameters:
   *       - in: path
   *         name: unitId
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *     responses:
   *       200:
   *         description: List of rent transactions for the unit
   *       500:
   *         description: Internal server error
   */
  async getTransactionsByUnit(req: Request, res: Response) {
    try {
      const transactions = await this.service.getTransactionsByUnit(req.params.unitId);
      ResponseUtils.success(res, transactions);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit transactions');
    }
  }

  /**
   * @swagger
   * /rent-transactions:
   *   post:
   *     summary: Create a new rent transaction
   *     tags: [Rent Transactions]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - leaseId
   *               - amount
   *               - transactionDate
   *               - type
   *             properties:
   *               leaseId:
   *                 type: string
   *               amount:
   *                 type: number
   *               transactionDate:
   *                 type: string
   *                 format: date
   *               type:
   *                 type: string
   *                 enum: [PAYMENT, CHARGE]
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Transaction created successfully
   *       500:
   *         description: Internal server error
   */
  async createTransaction(req: Request, res: Response) {
    try {
      const transaction = await this.service.createTransaction(req.body);
      ResponseUtils.created(res, transaction);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to create transaction');
    }
  }

  /**
   * @swagger
   * /rent-transactions/{id}:
   *   put:
   *     summary: Update a rent transaction
   *     tags: [Rent Transactions]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: number
   *               transactionDate:
   *                 type: string
   *                 format: date
   *               type:
   *                 type: string
   *                 enum: [PAYMENT, CHARGE]
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Transaction updated successfully
   *       404:
   *         description: Transaction not found
   *       500:
   *         description: Internal server error
   */
  async updateTransaction(req: Request, res: Response) {
    try {
      const transaction = await this.service.updateTransaction(req.params.id, req.body);
      if (!transaction) {
        return ResponseUtils.notFound(res, 'Transaction not found');
      }
      ResponseUtils.success(res, transaction);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to update transaction');
    }
  }

  /**
   * @swagger
   * /rent-transactions/{id}:
   *   delete:
   *     summary: Delete a rent transaction
   *     tags: [Rent Transactions]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID
   *     responses:
   *       204:
   *         description: Transaction deleted successfully
   *       404:
   *         description: Transaction not found
   *       500:
   *         description: Internal server error
   */
  async deleteTransaction(req: Request, res: Response) {
    try {
      const success = await this.service.deleteTransaction(req.params.id);
      if (!success) {
        return ResponseUtils.notFound(res, 'Transaction not found');
      }
      ResponseUtils.noContent(res);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete transaction');
    }
  }
}
