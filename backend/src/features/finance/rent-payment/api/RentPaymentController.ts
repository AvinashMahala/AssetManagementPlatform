
import { Request, Response } from 'express';
import { RentPaymentService } from '../core/RentPaymentService';
import { ResponseUtils } from '@/shared/utils/response';
import { ErrorUtils } from '@/shared/utils/error';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('RentPaymentController');

export class RentPaymentController {
  constructor(private readonly service: RentPaymentService) {}

  async getAllPayments(req: Request, res: Response) {
    try {
      const payments = await this.service.getAllPayments();
      ResponseUtils.success(res, payments);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch payments');
    }
  }

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

  async getPaymentsByLease(req: Request, res: Response) {
    try {
      const payments = await this.service.getPaymentsByLease(req.params.leaseId);
      ResponseUtils.success(res, payments);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch lease payments');
    }
  }

  async getPaymentsByProperty(req: Request, res: Response) {
    try {
      const payments = await this.service.getPaymentsByProperty(req.params.propertyId);
      ResponseUtils.success(res, payments);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch property payments');
    }
  }

  async getPaymentsByTenant(req: Request, res: Response) {
    try {
      const payments = await this.service.getPaymentsByTenant(req.params.tenantId);
      ResponseUtils.success(res, payments);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch tenant payments');
    }
  }

  async createPayment(req: Request, res: Response) {
    try {
      const payment = await this.service.createPayment(req.body);
      ResponseUtils.created(res, payment);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to create payment');
    }
  }

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
