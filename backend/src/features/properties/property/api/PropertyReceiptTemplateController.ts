import { Request, Response } from 'express';
import { GetPropertyByIdUseCase } from '../core/use-cases/GetPropertyById.usecase.js';
import { PropertyReceiptTemplateService } from '../core/services/PropertyReceiptTemplateService';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';

export class PropertyReceiptTemplateController {
  constructor(
    private getPropertyByIdUseCase: GetPropertyByIdUseCase,
    private propertyReceiptTemplateService: PropertyReceiptTemplateService
  ) {}

  async createTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const templateData = req.body;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const template = await this.propertyReceiptTemplateService.createTemplate(propertyId, templateData);
      ResponseUtils.created(res, template, 'Receipt template created successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('not found') || errorMessage.includes('already exists') ||
          errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to create receipt template');
      }
    }
  }

  async getTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const template = await this.propertyReceiptTemplateService.getTemplateByPropertyId(propertyId);
      if (!template) {
        return ResponseUtils.notFound(res, 'Receipt template not found');
      }

      ResponseUtils.success(res, template);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch receipt template');
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const updates = req.body;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const template = await this.propertyReceiptTemplateService.updateTemplate(propertyId, updates);
      if (!template) {
        return ResponseUtils.notFound(res, 'Receipt template not found');
      }

      ResponseUtils.success(res, template, 'Receipt template updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('not found') || errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update receipt template');
      }
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const result = await this.propertyReceiptTemplateService.deleteTemplate(propertyId);
      if (!result) {
        return ResponseUtils.notFound(res, 'Receipt template not found');
      }

      ResponseUtils.success(res, null, 'Receipt template deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete receipt template');
    }
  }

  async generateUPILinks(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { amount } = req.query;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const template = await this.propertyReceiptTemplateService.getTemplateByPropertyId(propertyId);
      if (!template) {
        return ResponseUtils.notFound(res, 'Receipt template not found');
      }

      const links = this.propertyReceiptTemplateService.generateUPILinks(template.wallets, amount ? Number(amount) : undefined);
      ResponseUtils.success(res, links);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to generate UPI links');
    }
  }
}
