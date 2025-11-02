import { Request, Response } from 'express';
import { ITenantService } from '../interfaces/services/ITenantService.js';
import { TenantInput, TenantDocument, DocumentType } from '../models/Tenant.js';
import { ValidationUtils } from '../utils/validation.js';
import { ResponseUtils } from '../utils/response.js';

export class TenantController {
  private tenantService: ITenantService;

  constructor(tenantService: ITenantService) {
    this.tenantService = tenantService;
  }

  /**
   * @swagger
   * /api/tenants:
   *   get:
   *     summary: Get all tenants
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of tenants retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Tenant'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // GET /tenants
  async getAllTenants(req: Request, res: Response): Promise<void> {
    try {
      const tenants = await this.tenantService.getAllTenants();
      ResponseUtils.success(res, tenants, 'Tenants retrieved successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to retrieve tenants');
    }
  }

  /**
   * @swagger
   * /api/tenants/{id}:
   *   get:
   *     summary: Get tenant by ID
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Tenant ID
   *     responses:
   *       200:
   *         description: Tenant retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Tenant'
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // GET /tenants/:id
  async getTenantById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const tenant = await this.tenantService.getTenantById(id);

      if (!tenant) {
        return ResponseUtils.notFound(res, 'Tenant not found');
      }

      ResponseUtils.success(res, tenant, 'Tenant retrieved successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to retrieve tenant');
    }
  }

  /**
   * @swagger
   * /api/tenants/email/{email}:
   *   get:
   *     summary: Get tenant by email
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: email
   *         required: true
   *         schema:
   *           type: string
   *           format: email
   *         description: Tenant email address
   *     responses:
   *       200:
   *         description: Tenant retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Tenant'
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // GET /tenants/email/:email
  async getTenantByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      const tenant = await this.tenantService.getTenantByEmail(email);

      if (!tenant) {
        return ResponseUtils.notFound(res, 'Tenant not found');
      }

      ResponseUtils.success(res, tenant, 'Tenant retrieved successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to retrieve tenant');
    }
  }

  /**
   * @swagger
   * /api/tenants/phone/{phone}:
   *   get:
   *     summary: Get tenant by phone
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: phone
   *         required: true
   *         schema:
   *           type: string
   *         description: Tenant phone number
   *     responses:
   *       200:
   *         description: Tenant retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Tenant'
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // GET /tenants/phone/:phone
  async getTenantByPhone(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.params;
      const tenant = await this.tenantService.getTenantByPhone(phone);

      if (!tenant) {
        return ResponseUtils.notFound(res, 'Tenant not found');
      }

      ResponseUtils.success(res, tenant, 'Tenant retrieved successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to retrieve tenant');
    }
  }

  /**
   * @swagger
   * /api/tenants:
   *   post:
   *     summary: Create a new tenant
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TenantInput'
   *     responses:
   *       201:
   *         description: Tenant created successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Tenant'
   *       400:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // POST /tenants
  async createTenant(req: Request, res: Response): Promise<void> {
    try {
      const tenantData: TenantInput = req.body;
      const tenant = await this.tenantService.createTenant(tenantData);
      ResponseUtils.created(res, tenant, 'Tenant created successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to create tenant');
    }
  }

  /**
   * @swagger
   * /api/tenants/{id}:
   *   put:
   *     summary: Update tenant
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Tenant ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               phone:
   *                 type: string
   *               dateOfBirth:
   *                 type: string
   *                 format: date
   *               gender:
   *                 type: string
   *                 enum: [male, female, other]
   *               occupation:
   *                 type: string
   *               monthlyIncome:
   *                 type: number
   *               currentAddress:
   *                 $ref: '#/components/schemas/TenantInput/properties/currentAddress'
   *               permanentAddress:
   *                 $ref: '#/components/schemas/TenantInput/properties/permanentAddress'
   *               emergencyContact:
   *                 $ref: '#/components/schemas/TenantInput/properties/emergencyContact'
   *               status:
   *                 type: string
   *                 enum: [active, inactive, blacklisted]
   *     responses:
   *       200:
   *         description: Tenant updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Tenant'
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       400:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // PUT /tenants/:id
  async updateTenant(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const tenantData: Partial<TenantInput> = req.body;
      const tenant = await this.tenantService.updateTenant(id, tenantData);

      if (!tenant) {
        return ResponseUtils.notFound(res, 'Tenant not found');
      }

      ResponseUtils.success(res, tenant, 'Tenant updated successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to update tenant');
    }
  }

  /**
   * @swagger
   * /api/tenants/{id}:
   *   delete:
   *     summary: Delete tenant
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Tenant ID
   *     responses:
   *       200:
   *         description: Tenant deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // DELETE /tenants/:id
  async deleteTenant(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deleted = await this.tenantService.deleteTenant(id);

      if (!deleted) {
        return ResponseUtils.notFound(res, 'Tenant not found');
      }

      ResponseUtils.success(res, null, 'Tenant deleted successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to delete tenant');
    }
  }

  /**
   * @swagger
   * /api/tenants/{id}/status:
   *   patch:
   *     summary: Update tenant status
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Tenant ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [active, inactive, blacklisted]
   *                 description: New tenant status
   *     responses:
   *       200:
   *         description: Tenant status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       400:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // PATCH /tenants/:id/status
  async updateTenantStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        return ResponseUtils.badRequest(res, 'Status is required');
      }

      const updated = await this.tenantService.updateTenantStatus(id, status);

      if (!updated) {
        return ResponseUtils.notFound(res, 'Tenant not found');
      }

      ResponseUtils.success(res, null, 'Tenant status updated successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to update tenant status');
    }
  }

  // Document management endpoints

  /**
   * @swagger
   * /api/tenants/{tenantId}/documents:
   *   post:
   *     summary: Add document to tenant
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Tenant ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - documentType
   *               - documentNumber
   *               - fileUrl
   *             properties:
   *               documentType:
   *                 type: string
   *                 enum: [aadhaar, pan, driving_license, passport, employment_letter, salary_slip, bank_statement, previous_landlord_reference]
   *                 description: Type of document
   *               documentNumber:
   *                 type: string
   *                 description: Document number
   *               fileUrl:
   *                 type: string
   *                 description: Document file URL
   *     responses:
   *       201:
   *         description: Document added successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                         tenantId:
   *                           type: string
   *                           format: uuid
   *                         documentType:
   *                           type: string
   *                         documentNumber:
   *                           type: string
   *                         fileUrl:
   *                           type: string
   *                         verified:
   *                           type: boolean
   *                         uploadedAt:
   *                           type: string
   *                           format: date-time
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       400:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // POST /tenants/:tenantId/documents
  async addTenantDocument(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const documentData: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'> = req.body;
      const document = await this.tenantService.addTenantDocument(tenantId, documentData);
      ResponseUtils.created(res, document, 'Document added successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to add document');
    }
  }

  /**
   * @swagger
   * /api/tenants/{tenantId}/documents:
   *   get:
   *     summary: Get tenant documents
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Tenant ID
   *     responses:
   *       200:
   *         description: Documents retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                           tenantId:
   *                             type: string
   *                             format: uuid
   *                           documentType:
   *                             type: string
   *                           documentNumber:
   *                             type: string
   *                           fileUrl:
   *                             type: string
   *                           verified:
   *                             type: boolean
   *                           verifiedAt:
   *                             type: string
   *                             format: date-time
   *                           verifiedBy:
   *                             type: string
   *                             format: uuid
   *                           uploadedAt:
   *                             type: string
   *                             format: date-time
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // GET /tenants/:tenantId/documents
  async getTenantDocuments(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const documents = await this.tenantService.getTenantDocuments(tenantId);
      ResponseUtils.success(res, documents, 'Documents retrieved successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to retrieve documents');
    }
  }

  /**
   * @swagger
   * /api/tenants/documents/{documentId}:
   *   put:
   *     summary: Update tenant document
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: documentId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Document ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               documentType:
   *                 type: string
   *                 enum: [aadhaar, pan, driving_license, passport, employment_letter, salary_slip, bank_statement, previous_landlord_reference]
   *               documentNumber:
   *                 type: string
   *               fileUrl:
   *                 type: string
   *               verified:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Document updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                         tenantId:
   *                           type: string
   *                           format: uuid
   *                         documentType:
   *                           type: string
   *                         documentNumber:
   *                           type: string
   *                         fileUrl:
   *                           type: string
   *                         verified:
   *                           type: boolean
   *                         verifiedAt:
   *                           type: string
   *                           format: date-time
   *                         verifiedBy:
   *                           type: string
   *                           format: uuid
   *                         uploadedAt:
   *                           type: string
   *                           format: date-time
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       400:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // PUT /tenants/documents/:documentId
  async updateTenantDocument(req: Request, res: Response): Promise<void> {
    try {
      const documentId = parseInt(req.params.documentId);
      const documentData: Partial<TenantDocument> = req.body;
      const document = await this.tenantService.updateTenantDocument(documentId, documentData);

      if (!document) {
        return ResponseUtils.notFound(res, 'Document not found');
      }

      ResponseUtils.success(res, document, 'Document updated successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to update document');
    }
  }

  /**
   * @swagger
   * /api/tenants/documents/{documentId}:
   *   delete:
   *     summary: Delete tenant document
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: documentId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Document ID
   *     responses:
   *       200:
   *         description: Document deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // DELETE /tenants/documents/:documentId
  async deleteTenantDocument(req: Request, res: Response): Promise<void> {
    try {
      const documentId = parseInt(req.params.documentId);
      const deleted = await this.tenantService.deleteTenantDocument(documentId);

      if (!deleted) {
        return ResponseUtils.notFound(res, 'Document not found');
      }

      ResponseUtils.success(res, null, 'Document deleted successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to delete document');
    }
  }

  /**
   * @swagger
   * /api/tenants/documents/{documentId}/verify:
   *   patch:
   *     summary: Verify tenant document
   *     tags: ['Tenants']
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: documentId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Document ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - verifiedBy
   *             properties:
   *               verifiedBy:
   *                 type: integer
   *                 description: User ID who is verifying the document
   *     responses:
   *       200:
   *         description: Document verified successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         $ref: '#/components/schemas/Error'
   *       400:
   *         $ref: '#/components/schemas/Error'
   *       401:
   *         $ref: '#/components/schemas/Error'
   *       500:
   *         $ref: '#/components/schemas/Error'
   */
  // PATCH /tenants/documents/:documentId/verify
  async verifyTenantDocument(req: Request, res: Response): Promise<void> {
    try {
      const documentId = parseInt(req.params.documentId);
      const { verifiedBy } = req.body;

      if (!verifiedBy) {
        return ResponseUtils.badRequest(res, 'Verified by user ID is required');
      }

      const verified = await this.tenantService.verifyTenantDocument(documentId, verifiedBy);

      if (!verified) {
        return ResponseUtils.notFound(res, 'Document not found');
      }

      ResponseUtils.success(res, null, 'Document verified successfully');
    } catch (error) {
      ResponseUtils.error(res, 'Failed to verify document');
    }
  }
}