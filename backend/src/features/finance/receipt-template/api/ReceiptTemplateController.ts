import { Request, Response } from 'express';
import { ReceiptTemplateService } from '@/features/finance/receipt-template/core/services/ReceiptTemplateService';
import { ReceiptTemplateInput, ReceiptTemplateType } from '@/features/finance/receipt-template/core/receipt-template.types';
import { ResponseUtils } from '@/shared/utils/response';
import { ErrorUtils } from '@/shared/utils/error';

export class ReceiptTemplateController {
  constructor(private templateService: ReceiptTemplateService) {}

  /**
   */
  async getAllTemplates(req: Request, res: Response) {
    try {
      const templates = await this.templateService.getAllTemplates();
      ResponseUtils.success(res, { templates });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   */
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await this.templateService.getTemplateById(id);

      if (!template) {
        return ResponseUtils.notFound(res, 'Template not found');
      }

      ResponseUtils.success(res, { template });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   */
  async getTemplateByType(req: Request, res: Response) {
    try {
      const { type } = req.params;

      if (!Object.values(ReceiptTemplateType).includes(type as ReceiptTemplateType)) {
        return ResponseUtils.badRequest(res, 'Invalid template type');
      }

      const template = await this.templateService.getTemplateByType(type as ReceiptTemplateType);

      if (!template) {
        return ResponseUtils.notFound(res, 'Template not found');
      }

      ResponseUtils.success(res, { template });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const templateData: ReceiptTemplateInput = req.body;
      const template = await this.templateService.createTemplate(templateData);
      ResponseUtils.created(res, { template });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const template = await this.templateService.updateTemplate(id, updateData);

      if (!template) {
        return ResponseUtils.notFound(res, 'Template not found');
      }

      ResponseUtils.success(res, { template });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await this.templateService.deleteTemplate(id);

      if (!deleted) {
        return ResponseUtils.notFound(res, 'Template not found');
      }

      ResponseUtils.success(res, { message: 'Template deleted successfully' });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   */
  async getDefaultTemplate(req: Request, res: Response) {
    try {
      const template = await this.templateService.getDefaultTemplate();

      if (!template) {
        return ResponseUtils.notFound(res, 'No default template found');
      }

      ResponseUtils.success(res, { template });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   */
  async setDefaultTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await this.templateService.setDefaultTemplate(id);

      if (!success) {
        return ResponseUtils.notFound(res, 'Template not found');
      }

      ResponseUtils.success(res, { message: 'Template set as default successfully' });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /** */
  async getAvailableTemplates(req: Request, res: Response) {
    try {
      const templates = await this.templateService.getAvailableTemplates();
      ResponseUtils.success(res, { templates });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /** */
  async getPropertyTemplateSettings(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const settings = await this.templateService.getPropertyTemplateSettings(propertyId);

      if (!settings) {
        return ResponseUtils.notFound(res, 'No template settings found for property');
      }

      ResponseUtils.success(res, { settings });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /** */
  async setPropertyTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { templateId, overrides } = req.body;

      if (!templateId) {
        return ResponseUtils.badRequest(res, 'Template ID is required');
      }

      const success = await this.templateService.setPropertyTemplate(propertyId, templateId, overrides);

      if (!success) {
        return ResponseUtils.notFound(res, 'Property or template not found');
      }

      ResponseUtils.success(res, { message: 'Property template set successfully' });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }
}