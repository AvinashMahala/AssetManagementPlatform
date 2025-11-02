import { Request, Response } from 'express';
import { IAssetService } from '../interfaces/services/IAssetService.js';
import { AssetInput } from '../models/Asset.js';
import { ResponseUtils } from '../utils/response.js';
import { ErrorUtils } from '../utils/error.js';

export class AssetController {
  private service: IAssetService;

  constructor(service: IAssetService) {
    this.service = service;
  }

  /**
   * @swagger
   * /api/assets:
   *   get:
   *     tags: ['Assets']
   *     summary: Get all assets
   *     responses:
   *       200:
   *         description: List of assets
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 assets:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Asset'
   */
  async getAll(req: Request, res: Response) {
    try {
      const assets = await this.service.getAllAssets();
      ResponseUtils.success(res, { assets });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch assets');
    }
  }

  /**
   * @swagger
   * /api/assets:
   *   post:
   *     tags: ['Assets']
   *     summary: Create a new asset
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AssetInput'
   *     responses:
   *       201:
   *         description: Asset created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Asset'
   */
  async create(req: Request, res: Response) {
    try {
      const assetData: AssetInput = req.body;
      const asset = await this.service.createAsset(assetData);
      ResponseUtils.created(res, asset, 'Asset created successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to create asset');
      }
    }
  }
}