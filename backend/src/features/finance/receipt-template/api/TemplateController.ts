import { Response } from 'express';
import { Pool } from 'pg';
import { TemplateCustomizationService } from '../core/services/TemplateCustomizationService';
import { HTTP_STATUS } from '@/shared/constants/http';
import { AuthenticatedRequest } from '@/shared/middleware/authMiddleware';

export class TemplateController {
  private service: TemplateCustomizationService;

  constructor(pool: Pool) {
    this.service = new TemplateCustomizationService(pool);
  }

  getAllTemplates = async (req: any, res: Response) => {
    try {
      const templates = await this.service.getAllTemplates();
      res.status(HTTP_STATUS.OK).json({ success: true, data: templates });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to fetch templates',
        error: error.message 
      });
    }
  };

  getTemplateById = async (req: any, res: Response) => {
    try {
      const template = await this.service.getTemplateById(req.params.id);
      if (!template) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ 
          success: false, 
          message: 'Template not found' 
        });
      }
      res.status(HTTP_STATUS.OK).json({ success: true, data: template });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to fetch template',
        error: error.message 
      });
    }
  };

  getPropertyTemplateSettings = async (req: any, res: Response) => {
    try {
      const settings = await this.service.getPropertyTemplateSettings(req.params.propertyId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to fetch property template settings',
        error: error.message 
      });
    }
  };

  updatePropertyTemplateSettings = async (req: any, res: Response) => {
    try {
      const settings = await this.service.updatePropertyTemplateSettings(req.params.propertyId, req.body);
      res.status(HTTP_STATUS.OK).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to update property template settings',
        error: error.message 
      });
    }
  };

  getAvailablePlaceholders = async (req: any, res: Response) => {
    try {
      const placeholders = this.service.getAvailablePlaceholders();
      res.status(HTTP_STATUS.OK).json({ success: true, data: placeholders });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to fetch placeholders',
        error: error.message 
      });
    }
  };

  generatePreview = async (req: any, res: Response) => {
    try {
      const previewRequest = {
        templateId: req.params.id,
        propertyId: req.body.propertyId,
        sampleData: req.body.sampleData,
        customizations: req.body.customizations,
        format: req.body.format || 'html',
      };
      
      const preview = await this.service.generatePreview(previewRequest);
      
      if (preview.success) {
        res.status(HTTP_STATUS.OK).json({ success: true, data: preview });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
          success: false, 
          message: preview.error 
        });
      }
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to generate preview',
        error: error.message 
      });
    }
  };

  exportTemplate = async (req: any, res: Response) => {
    try {
      const exportData = await this.service.exportTemplate(req.params.id);
      res.status(HTTP_STATUS.OK).json(exportData);
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to export template',
        error: error.message 
      });
    }
  };

  importTemplate = async (req: any, res: Response) => {
    try {
      const newTemplateId = await this.service.importTemplate(req.body, req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID);
      res.status(HTTP_STATUS.CREATED).json({ 
        success: true, 
        data: { id: newTemplateId },
        message: 'Template imported successfully'
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        success: false, 
        message: 'Failed to import template',
        error: error.message 
      });
    }
  };

  duplicateTemplate = async (req: any, res: Response) => {
    try {
      const { name } = req.body;
      const newTemplateId = await this.service.duplicateTemplate(req.params.id, name);
      res.status(HTTP_STATUS.CREATED).json({ 
        success: true, 
        data: { id: newTemplateId },
        message: 'Template duplicated successfully'
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to duplicate template',
        error: error.message 
      });
    }
  };
}
