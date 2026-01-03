
import { Request, Response } from 'express';
import { RentTransactionService } from '../core/RentTransactionService';
import { ResponseUtils } from '@/shared/utils/response';
import { ErrorUtils } from '@/shared/utils/error';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('RentTransactionController');

export class RentTransactionController {
  constructor(private readonly service: RentTransactionService) {}

  async getAllTransactions(req: Request, res: Response) {
    try {
      const transactions = await this.service.getAllTransactions();
      ResponseUtils.success(res, transactions);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch transactions');
    }
  }

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

  async getTransactionsByLease(req: Request, res: Response) {
    try {
      const transactions = await this.service.getTransactionsByLease(req.params.leaseId);
      ResponseUtils.success(res, transactions);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch lease transactions');
    }
  }

  async getTransactionsByProperty(req: Request, res: Response) {
    try {
      const transactions = await this.service.getTransactionsByProperty(req.params.propertyId);
      ResponseUtils.success(res, transactions);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch property transactions');
    }
  }

  async getTransactionsByTenant(req: Request, res: Response) {
    try {
      const transactions = await this.service.getTransactionsByTenant(req.params.tenantId);
      ResponseUtils.success(res, transactions);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch tenant transactions');
    }
  }

  async getTransactionsByUnit(req: Request, res: Response) {
    try {
      const transactions = await this.service.getTransactionsByUnit(req.params.unitId);
      ResponseUtils.success(res, transactions);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit transactions');
    }
  }

  async createTransaction(req: Request, res: Response) {
    try {
      const transaction = await this.service.createTransaction(req.body);
      ResponseUtils.created(res, transaction);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to create transaction');
    }
  }

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
